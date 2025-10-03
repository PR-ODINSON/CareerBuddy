#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

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
  title: (msg) => console.log(`${colors.bright}🔧 ${msg}${colors.reset}`)
};

// Check if Python is installed
async function checkPython() {
  const commands = ['python3', 'python', 'py'];
  
  for (const cmd of commands) {
    try {
      const result = await execCommand(`${cmd} --version`);
      if (result.includes('Python 3.')) {
        log.success(`Found Python: ${result.trim()}`);
        return cmd;
      }
    } catch (error) {
      // Command not found, continue
    }
  }
  
  return null;
}

// Execute command
function execCommand(command) {
  return new Promise((resolve, reject) => {
    const { exec } = require('child_process');
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout || stderr);
      }
    });
  });
}

// Install dependencies for a service
async function installServiceDependencies(servicePath, serviceName, pythonCmd) {
  const requirementsPath = path.join(servicePath, 'requirements.txt');
  
  if (!fs.existsSync(requirementsPath)) {
    log.warning(`No requirements.txt found for ${serviceName}`);
    return false;
  }

  log.info(`Installing dependencies for ${serviceName}...`);
  
  try {
    // First, upgrade pip
    await execCommand(`${pythonCmd} -m pip install --upgrade pip`);
    
    // Install requirements
    const result = await execCommand(`${pythonCmd} -m pip install -r "${requirementsPath}"`);
    log.success(`Dependencies installed for ${serviceName}`);
    return true;
  } catch (error) {
    log.error(`Failed to install dependencies for ${serviceName}: ${error.message}`);
    return false;
  }
}

// Create virtual environment
async function createVirtualEnv(servicePath, serviceName, pythonCmd) {
  const venvPath = path.join(servicePath, 'venv');
  
  if (fs.existsSync(venvPath)) {
    log.info(`Virtual environment already exists for ${serviceName}`);
    return true;
  }

  log.info(`Creating virtual environment for ${serviceName}...`);
  
  try {
    await execCommand(`${pythonCmd} -m venv "${venvPath}"`);
    log.success(`Virtual environment created for ${serviceName}`);
    return true;
  } catch (error) {
    log.error(`Failed to create virtual environment for ${serviceName}: ${error.message}`);
    return false;
  }
}

// Get virtual environment Python command
function getVenvPythonCmd(servicePath) {
  const venvPath = path.join(servicePath, 'venv');
  const isWindows = process.platform === 'win32';
  
  if (isWindows) {
    return path.join(venvPath, 'Scripts', 'python.exe');
  } else {
    return path.join(venvPath, 'bin', 'python');
  }
}

// Test service startup
async function testServiceStartup(servicePath, serviceName, pythonCmd) {
  const mainPath = path.join(servicePath, 'main.py');
  
  if (!fs.existsSync(mainPath)) {
    log.error(`main.py not found for ${serviceName}`);
    return false;
  }

  log.info(`Testing ${serviceName} startup...`);
  
  return new Promise((resolve) => {
    const testProcess = spawn(pythonCmd, [mainPath], {
      cwd: servicePath,
      env: { 
        ...process.env, 
        PYTHONPATH: servicePath,
        PYTHONUNBUFFERED: '1'
      },
      stdio: 'pipe'
    });

    let started = false;
    let timeout;

    // Set a timeout for the test
    timeout = setTimeout(() => {
      if (!started) {
        testProcess.kill('SIGTERM');
        log.warning(`${serviceName} startup test timed out`);
        resolve(false);
      }
    }, 15000); // 15 seconds timeout

    testProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Application startup complete') || 
          output.includes('Uvicorn running') ||
          output.includes('server started')) {
        started = true;
        clearTimeout(timeout);
        testProcess.kill('SIGTERM');
        log.success(`${serviceName} startup test passed`);
        resolve(true);
      }
    });

    testProcess.stderr.on('data', (data) => {
      const output = data.toString();
      if (output.includes('ModuleNotFoundError') || 
          output.includes('ImportError') ||
          output.includes('Error')) {
        clearTimeout(timeout);
        testProcess.kill('SIGTERM');
        log.error(`${serviceName} startup test failed: ${output.trim()}`);
        resolve(false);
      }
    });

    testProcess.on('close', (code) => {
      clearTimeout(timeout);
      if (!started) {
        log.warning(`${serviceName} test process exited with code ${code}`);
        resolve(false);
      }
    });

    testProcess.on('error', (error) => {
      clearTimeout(timeout);
      log.error(`${serviceName} test process error: ${error.message}`);
      resolve(false);
    });
  });
}

// Main setup function
async function setupAiServices() {
  log.title('Setting up AI Services');

  // Find project root
  let projectRoot = path.join(__dirname, '..', '..');
  const aiServicesPath = path.join(projectRoot, 'ai-services');
  
  if (!fs.existsSync(aiServicesPath)) {
    log.error('AI services directory not found');
    process.exit(1);
  }

  // Check Python installation
  const pythonCmd = await checkPython();
  if (!pythonCmd) {
    log.error('Python 3.9+ is required but not found');
    log.info('Please install Python from https://python.org');
    process.exit(1);
  }

  // Service configurations
  const services = [
    {
      name: 'resume-analyzer',
      path: path.join(aiServicesPath, 'resume-analyzer')
    },
    {
      name: 'job-matcher',
      path: path.join(aiServicesPath, 'job-matcher')
    }
  ];

  let allSuccess = true;

  for (const service of services) {
    log.title(`Setting up ${service.name}`);

    if (!fs.existsSync(service.path)) {
      log.error(`Service directory not found: ${service.path}`);
      allSuccess = false;
      continue;
    }

    // Create virtual environment (optional but recommended)
    const useVenv = process.argv.includes('--venv');
    let servicePythonCmd = pythonCmd;
    
    if (useVenv) {
      const venvCreated = await createVirtualEnv(service.path, service.name, pythonCmd);
      if (venvCreated) {
        servicePythonCmd = getVenvPythonCmd(service.path);
      }
    }

    // Install dependencies
    const depsInstalled = await installServiceDependencies(service.path, service.name, servicePythonCmd);
    if (!depsInstalled) {
      allSuccess = false;
      continue;
    }

    // Test startup
    const startupTest = await testServiceStartup(service.path, service.name, servicePythonCmd);
    if (!startupTest) {
      allSuccess = false;
      log.warning(`${service.name} may have issues starting`);
    }
  }

  if (allSuccess) {
    log.success('All AI services are set up successfully!');
    log.info('You can now start the backend with: npm run start:dev');
    log.info('The AI services will be automatically managed by the backend');
  } else {
    log.warning('Some AI services had setup issues');
    log.info('Check the error messages above and resolve any dependency issues');
  }

  return allSuccess;
}

// Command line interface
async function main() {
  try {
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
      console.log(`
CareerBuddy AI Services Setup

Usage: node setup-ai-services.js [options]

Options:
  --venv          Create virtual environments for each service
  --help, -h      Show this help message

This script will:
1. Check for Python 3.9+ installation
2. Install required dependencies for AI services
3. Test that services can start properly
4. Prepare services for automatic management by the backend

After setup, the AI services will be automatically started when you run:
npm run start:dev
      `);
      return;
    }

    await setupAiServices();
  } catch (error) {
    log.error(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = { setupAiServices, checkPython };
