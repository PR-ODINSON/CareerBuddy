#!/usr/bin/env node

const { spawn } = require('child_process');
const axios = require('axios');
const path = require('path');

// Configuration
const AI_SERVICES = {
  resumeAnalyzer: process.env.AI_RESUME_ANALYZER_URL || 'http://localhost:8001',
  jobMatcher: process.env.AI_JOB_MATCHER_URL || 'http://localhost:8002'
};

const MAX_ATTEMPTS = 30;
const RETRY_INTERVAL = 10000; // 10 seconds
const HEALTH_TIMEOUT = 5000; // 5 seconds

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  title: (msg) => console.log(`${colors.bright}🚀 ${msg}${colors.reset}`)
};

// Check if a service is healthy
async function checkServiceHealth(serviceName, url) {
  try {
    const response = await axios.get(`${url}/health`, { 
      timeout: HEALTH_TIMEOUT,
      validateStatus: () => true // Don't throw on non-2xx status codes
    });
    
    if (response.status === 200) {
      log.success(`${serviceName} is healthy at ${url}`);
      return true;
    } else {
      log.error(`${serviceName} returned status ${response.status} at ${url}`);
      return false;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log.error(`${serviceName} is not responding at ${url} (connection refused)`);
    } else if (error.code === 'TIMEOUT') {
      log.error(`${serviceName} health check timed out at ${url}`);
    } else {
      log.error(`${serviceName} health check failed at ${url}: ${error.message}`);
    }
    return false;
  }
}

// Check all AI services
async function checkAllServices() {
  log.info('Checking AI services health...');
  
  const results = await Promise.all([
    checkServiceHealth('Resume Analyzer', AI_SERVICES.resumeAnalyzer),
    checkServiceHealth('Job Matcher', AI_SERVICES.jobMatcher)
  ]);
  
  return results.every(result => result);
}

// Start AI services using docker-compose
async function startAiServices() {
  return new Promise((resolve, reject) => {
    log.info('Starting AI services with docker-compose...');
    
    // Try ai-services/docker-compose.yml first
    let dockerComposePath = path.join(__dirname, '../../ai-services');
    let args = ['up', '-d'];
    
    // Check if ai-services directory exists, otherwise use root docker-compose
    const fs = require('fs');
    if (!fs.existsSync(path.join(dockerComposePath, 'docker-compose.yml'))) {
      dockerComposePath = path.join(__dirname, '../..');
      args = ['up', '-d', 'resume-analyzer', 'job-matcher'];
    }
    
    const dockerCompose = spawn('docker-compose', args, {
      cwd: dockerComposePath,
      stdio: 'inherit'
    });
    
    dockerCompose.on('close', (code) => {
      if (code === 0) {
        log.success('Docker Compose started successfully');
        resolve();
      } else {
        log.error(`Docker Compose failed with exit code ${code}`);
        reject(new Error(`Docker Compose failed with exit code ${code}`));
      }
    });
    
    dockerCompose.on('error', (error) => {
      log.error(`Failed to start docker-compose: ${error.message}`);
      reject(error);
    });
  });
}

// Wait for services to be ready
async function waitForServices() {
  log.info('Waiting for AI services to be ready...');
  
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    log.info(`Health check attempt ${attempt}/${MAX_ATTEMPTS}`);
    
    if (await checkAllServices()) {
      log.success('All AI services are ready!');
      return true;
    }
    
    if (attempt < MAX_ATTEMPTS) {
      log.info(`Waiting ${RETRY_INTERVAL / 1000} seconds before next attempt...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
    }
  }
  
  log.warning('AI services are not ready after maximum attempts.');
  log.warning('Backend will start anyway, but AI features may not work properly.');
  
  console.log('\n🔧 Troubleshooting steps:');
  console.log('1. Ensure Docker is running');
  console.log('2. Run "docker-compose up -d" in the ai-services directory');
  console.log('3. Check logs: "docker-compose logs resume-analyzer job-matcher"');
  console.log('4. Verify ports 8001 and 8002 are not in use');
  console.log('');
  
  return false;
}

// Start the backend application
async function startBackend() {
  return new Promise((resolve, reject) => {
    log.info('Starting CareerBuddy Backend...');
    
    const isProduction = process.env.NODE_ENV === 'production';
    const script = isProduction ? 'start:prod' : 'start:dev';
    
    log.info(`Starting in ${isProduction ? 'production' : 'development'} mode...`);
    
    const backend = spawn('npm', ['run', script], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
    
    backend.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Backend process exited with code ${code}`));
      }
    });
    
    backend.on('error', (error) => {
      log.error(`Failed to start backend: ${error.message}`);
      reject(error);
    });
    
    // Handle process termination
    process.on('SIGINT', () => {
      log.info('Received SIGINT, shutting down gracefully...');
      backend.kill('SIGTERM');
    });
    
    process.on('SIGTERM', () => {
      log.info('Received SIGTERM, shutting down gracefully...');
      backend.kill('SIGTERM');
    });
  });
}

// Main execution function
async function main() {
  try {
    log.title('Starting CareerBuddy Backend with AI Services');
    
    // Check if we're in a Docker environment
    const isDocker = require('fs').existsSync('/.dockerenv');
    
    if (isDocker) {
      log.info('Running in Docker environment, skipping AI service startup');
    } else {
      log.info('Running in local environment');
      
      // Check if AI services are already running
      const servicesReady = await checkAllServices();
      
      if (!servicesReady) {
        try {
          await startAiServices();
          await waitForServices();
        } catch (error) {
          log.error(`Failed to start AI services: ${error.message}`);
          log.warning('Continuing with backend startup...');
        }
      } else {
        log.success('AI services are already running!');
      }
    }
    
    // Start the backend
    await startBackend();
    
  } catch (error) {
    log.error(`Startup failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (require.main === module) {
  main().catch((error) => {
    log.error(`Unhandled error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  checkAllServices,
  startAiServices,
  waitForServices,
  startBackend,
  main
};
