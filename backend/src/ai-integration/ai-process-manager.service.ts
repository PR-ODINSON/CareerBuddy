import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

interface AIServiceConfig {
  name: string;
  scriptPath: string;
  port: number;
  env: Record<string, string>;
  healthUrl: string;
}

@Injectable()
export class AiProcessManagerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AiProcessManagerService.name);
  private readonly processes: Map<string, ChildProcess> = new Map();
  private readonly serviceConfigs: AIServiceConfig[] = [];

  constructor(private configService: ConfigService) {
    this.initializeServiceConfigs();
  }

  async onModuleInit() {
    // Only start AI services if we're not in Docker and they're not already running
    const isDocker = fs.existsSync('/.dockerenv');
    const shouldManageServices = this.configService.get<string>('MANAGE_AI_SERVICES', 'true') === 'true';

    if (!isDocker && shouldManageServices) {
      this.logger.log('Starting integrated AI services management...');
      await this.startAllServices();
    } else {
      this.logger.log('Skipping AI services startup (Docker environment or disabled)');
    }
  }

  async onModuleDestroy() {
    this.logger.log('Shutting down AI services...');
    await this.stopAllServices();
  }

  private initializeServiceConfigs() {
    const projectRoot = this.getProjectRoot();
    
    this.serviceConfigs.push(
      {
        name: 'resume-analyzer',
        scriptPath: path.join(projectRoot, 'ai-services', 'resume-analyzer', 'main.py'),
        port: 8001,
        env: {
          PORT: '8001',
          PYTHONPATH: path.join(projectRoot, 'ai-services', 'resume-analyzer'),
          PYTHONUNBUFFERED: '1'
        },
        healthUrl: 'http://localhost:8001/health'
      },
      {
        name: 'job-matcher',
        scriptPath: path.join(projectRoot, 'ai-services', 'job-matcher', 'main.py'),
        port: 8002,
        env: {
          PORT: '8002',
          PYTHONPATH: path.join(projectRoot, 'ai-services', 'job-matcher'),
          PYTHONUNBUFFERED: '1'
        },
        healthUrl: 'http://localhost:8002/health'
      }
    );
  }

  private getProjectRoot(): string {
    // Navigate from backend/src/ai-integration to project root
    let currentPath = __dirname;
    
    // Go up until we find the ai-services directory
    while (currentPath !== path.parse(currentPath).root) {
      const aiServicesPath = path.join(currentPath, 'ai-services');
      if (fs.existsSync(aiServicesPath)) {
        return currentPath;
      }
      currentPath = path.dirname(currentPath);
    }
    
    // Fallback: assume we're in backend/src/ai-integration
    return path.join(__dirname, '..', '..', '..');
  }

  private async startAllServices(): Promise<void> {
    const startPromises = this.serviceConfigs.map(config => this.startService(config));
    await Promise.allSettled(startPromises);
  }

  private async startService(config: AIServiceConfig): Promise<void> {
    try {
      // Check if script exists
      if (!fs.existsSync(config.scriptPath)) {
        this.logger.error(`AI service script not found: ${config.scriptPath}`);
        return;
      }

      // Check if port is available
      if (await this.isPortInUse(config.port)) {
        this.logger.warn(`Port ${config.port} is already in use, skipping ${config.name}`);
        return;
      }

      this.logger.log(`Starting ${config.name} service on port ${config.port}...`);

      // Check for Python and required dependencies
      const pythonCmd = await this.getPythonCommand();
      if (!pythonCmd) {
        this.logger.error(`Python not found. Please install Python 3.9+ to run AI services.`);
        return;
      }

      // Spawn the Python process
      const childProcess = spawn(pythonCmd, [config.scriptPath], {
        env: { ...process.env, ...config.env },
        cwd: path.dirname(config.scriptPath),
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: false
      });

      // Store the process
      this.processes.set(config.name, childProcess);

      // Handle process events
      childProcess.stdout?.on('data', (data) => {
        this.logger.debug(`[${config.name}] ${data.toString().trim()}`);
      });

      childProcess.stderr?.on('data', (data) => {
        const output = data.toString().trim();
        if (!output.includes('INFO:') && !output.includes('WARNING:')) {
          this.logger.warn(`[${config.name}] ${output}`);
        }
      });

      childProcess.on('close', (code) => {
        this.logger.warn(`[${config.name}] Process exited with code ${code}`);
        this.processes.delete(config.name);
      });

      childProcess.on('error', (error) => {
        this.logger.error(`[${config.name}] Process error: ${error.message}`);
        this.processes.delete(config.name);
      });

      // Wait a moment for the process to start
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if process is still running
      if (!childProcess.killed && childProcess.pid) {
        this.logger.log(`✅ ${config.name} started successfully (PID: ${childProcess.pid})`);
      } else {
        this.logger.error(`❌ ${config.name} failed to start`);
      }

    } catch (error) {
      this.logger.error(`Failed to start ${config.name}: ${error.message}`);
    }
  }

  private async stopAllServices(): Promise<void> {
    for (const [name, childProcess] of this.processes.entries()) {
      try {
        this.logger.log(`Stopping ${name}...`);
        
        if (!childProcess.killed) {
          childProcess.kill('SIGTERM');
          
          // Wait for graceful shutdown
          await new Promise(resolve => {
            const timeout = setTimeout(() => {
              if (!childProcess.killed) {
                childProcess.kill('SIGKILL');
              }
              resolve(undefined);
            }, 5000);

            childProcess.on('close', () => {
              clearTimeout(timeout);
              resolve(undefined);
            });
          });
        }
      } catch (error) {
        this.logger.error(`Error stopping ${name}: ${error.message}`);
      }
    }
    
    this.processes.clear();
  }

  private async getPythonCommand(): Promise<string | null> {
    const commands = ['python3', 'python', 'py'];
    
    for (const cmd of commands) {
      try {
        const result = await this.execCommand(`${cmd} --version`);
        if (result.includes('Python 3.')) {
          return cmd;
        }
      } catch (error) {
        // Command not found, continue
      }
    }
    
    return null;
  }

  private execCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const { exec } = require('child_process');
      exec(command, (error: any, stdout: string, stderr: string) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout || stderr);
        }
      });
    });
  }

  private async isPortInUse(port: number): Promise<boolean> {
    try {
      const { exec } = require('child_process');
      return new Promise((resolve) => {
        // Cross-platform port checking
        const command = process.platform === 'win32' 
          ? `netstat -an | findstr :${port}`
          : `lsof -i :${port}`;
          
        exec(command, (error: any, stdout: string) => {
          resolve(!!stdout.trim());
        });
      });
    } catch {
      return false;
    }
  }

  // Public methods for external use
  async getServiceStatus(): Promise<Record<string, { running: boolean; pid?: number }>> {
    const status: Record<string, { running: boolean; pid?: number }> = {};
    
    for (const config of this.serviceConfigs) {
      const childProcess = this.processes.get(config.name);
      status[config.name] = {
        running: !!childProcess && !childProcess.killed,
        pid: childProcess?.pid
      };
    }
    
    return status;
  }

  async restartService(serviceName: string): Promise<boolean> {
    const config = this.serviceConfigs.find(c => c.name === serviceName);
    if (!config) {
      this.logger.error(`Service configuration not found: ${serviceName}`);
      return false;
    }

    // Stop if running
    const existingProcess = this.processes.get(serviceName);
    if (existingProcess && !existingProcess.killed) {
      existingProcess.kill('SIGTERM');
      this.processes.delete(serviceName);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Restart
    await this.startService(config);
    return true;
  }

  getRunningServices(): string[] {
    return Array.from(this.processes.keys()).filter(name => {
      const childProcess = this.processes.get(name);
      return childProcess && !childProcess.killed;
    });
  }

  async installDependencies(): Promise<boolean> {
    this.logger.log('Installing AI services dependencies...');
    
    try {
      const pythonCmd = await this.getPythonCommand();
      if (!pythonCmd) {
        this.logger.error('Python not found');
        return false;
      }

      for (const config of this.serviceConfigs) {
        const servicePath = path.dirname(config.scriptPath);
        const requirementsPath = path.join(servicePath, 'requirements.txt');
        
        if (fs.existsSync(requirementsPath)) {
          this.logger.log(`Installing dependencies for ${config.name}...`);
          
          try {
            await this.execCommand(`${pythonCmd} -m pip install -r "${requirementsPath}"`);
            this.logger.log(`✅ Dependencies installed for ${config.name}`);
          } catch (error) {
            this.logger.error(`❌ Failed to install dependencies for ${config.name}: ${error.message}`);
          }
        }
      }
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to install dependencies: ${error.message}`);
      return false;
    }
  }
}
