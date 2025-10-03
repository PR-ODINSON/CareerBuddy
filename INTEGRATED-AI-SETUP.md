# Integrated AI Services Setup

CareerBuddy now includes **integrated AI services management** that automatically starts and manages the Python AI services (Resume Analyzer and Job Matcher) directly from the backend. No Docker required for development!

## 🚀 Quick Start

### 1. Setup AI Services (One-time)

```bash
cd backend
npm run setup:ai
```

This will:
- Check for Python 3.9+ installation
- Install required Python dependencies
- Test that AI services can start properly
- Prepare services for automatic management

### 2. Start Backend with Integrated AI

```bash
cd backend
npm run start:dev
```

The backend will now:
- ✅ Automatically start Python AI services
- ✅ Monitor their health
- ✅ Handle graceful shutdown
- ✅ Provide management endpoints

## 📋 Prerequisites

### Required
- **Node.js 18+** (for backend)
- **Python 3.9+** (for AI services)

### Installation

#### Windows
```bash
# Install Python from python.org or via Windows Store
# Or use Chocolatey
choco install python

# Install Node.js
choco install nodejs
```

#### macOS
```bash
# Install Python
brew install python@3.11

# Install Node.js
brew install node
```

#### Ubuntu/Debian
```bash
# Install Python
sudo apt update
sudo apt install python3.11 python3.11-pip python3.11-venv

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## 🔧 Setup Options

### Basic Setup
```bash
npm run setup:ai
```

### With Virtual Environments (Recommended)
```bash
npm run setup:ai:venv
```

### Manual Setup
```bash
# Setup AI services
cd ../ai-services/resume-analyzer
pip install -r requirements.txt

cd ../job-matcher
pip install -r requirements.txt
```

## 🏃 Running the Application

### Development Mode
```bash
cd backend
npm run start:dev
```

### Production Mode
```bash
cd backend
npm run build
npm run start:prod
```

### With Custom AI Service Management
```bash
# Disable automatic AI service management
MANAGE_AI_SERVICES=false npm run start:dev

# Or set in .env file
echo "MANAGE_AI_SERVICES=false" >> .env
```

## 📊 Monitoring & Management

### Health Check Endpoints

```bash
# Overall health (includes AI services)
curl http://localhost:3001/api/health

# AI services health only
curl http://localhost:3001/api/health/ai

# AI process status
curl http://localhost:3001/api/ai/status
```

### Management Endpoints

```bash
# Restart a specific AI service
curl -X POST http://localhost:3001/api/ai/restart/resume-analyzer
curl -X POST http://localhost:3001/api/ai/restart/job-matcher

# Install/update AI dependencies
curl -X POST http://localhost:3001/api/ai/install-dependencies
```

## 🔄 Service Management

### Automatic Features
- **Auto-start**: AI services start automatically with backend
- **Health monitoring**: Continuous health checks with retry logic
- **Graceful shutdown**: Services stop cleanly when backend stops
- **Process recovery**: Failed services can be restarted via API

### Manual Control
```bash
# Check what's running
curl http://localhost:3001/api/ai/status

# Restart individual services
curl -X POST http://localhost:3001/api/ai/restart/resume-analyzer
```

## 🌟 Integration Features

### Backend Integration
- **Seamless startup**: One command starts everything
- **Health monitoring**: Built-in health checks and monitoring
- **Error handling**: Graceful degradation when AI services are unavailable
- **Logging**: Centralized logging for all services

### Service Discovery
- **Automatic detection**: Backend automatically finds and manages AI services
- **Port management**: Automatic port conflict detection
- **Environment setup**: Proper environment variable configuration

### Development Experience
- **Hot reload**: Backend development with automatic AI service management
- **Error reporting**: Clear error messages and troubleshooting guidance
- **Status monitoring**: Real-time status of all services

## 🔍 Troubleshooting

### Common Issues

#### 1. Python Not Found
```bash
# Check Python installation
python3 --version
python --version
py --version

# Install Python 3.9+
# Windows: Download from python.org
# macOS: brew install python@3.11
# Linux: sudo apt install python3.11
```

#### 2. Dependencies Installation Failed
```bash
# Update pip first
python3 -m pip install --upgrade pip

# Install dependencies manually
cd ai-services/resume-analyzer
pip install -r requirements.txt

cd ../job-matcher
pip install -r requirements.txt
```

#### 3. Port Conflicts
```bash
# Check what's using the ports
netstat -an | grep "8001\|8002"
lsof -i :8001
lsof -i :8002

# Kill conflicting processes
kill -9 $(lsof -ti:8001)
kill -9 $(lsof -ti:8002)
```

#### 4. Service Won't Start
```bash
# Check service logs in backend console
npm run start:dev

# Test individual service
cd ai-services/resume-analyzer
python3 main.py

# Check dependencies
pip list | grep -E "(fastapi|uvicorn|pydantic)"
```

#### 5. Module Import Errors
```bash
# Ensure PYTHONPATH is set correctly
export PYTHONPATH=/path/to/ai-services/resume-analyzer:$PYTHONPATH

# Or reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Debug Mode
```bash
# Start with debug logging
DEBUG=* npm run start:dev

# Check AI service startup logs
# Look for [AiProcessManagerService] and [AiHealthService] messages
```

### Service Logs
The backend console will show:
- AI service startup messages
- Health check results
- Error messages with troubleshooting hints
- Process status updates

## 🎯 Environment Configuration

### Backend Environment Variables
```env
# .env file in backend directory
MANAGE_AI_SERVICES=true                    # Enable AI service management
AI_RESUME_ANALYZER_URL=http://localhost:8001
AI_JOB_MATCHER_URL=http://localhost:8002
```

### AI Service Ports
- **Resume Analyzer**: Port 8001
- **Job Matcher**: Port 8002
- **Backend**: Port 3001
- **Frontend**: Port 3000

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│   Frontend      │◄──►│     Backend      │◄──►│   AI Services   │
│   (Port 3000)   │    │   (Port 3001)    │    │                 │
│                 │    │                  │    │  Resume: 8001   │
└─────────────────┘    │  ┌─────────────┐ │    │  JobMatch: 8002 │
                       │  │   Process   │ │    │                 │
                       │  │  Manager    │ │    └─────────────────┘
                       │  └─────────────┘ │
                       │  ┌─────────────┐ │
                       │  │   Health    │ │
                       │  │  Monitor    │ │
                       │  └─────────────┘ │
                       └──────────────────┘
```

## 📚 API Integration

### Using AI Services in Code

```typescript
// In your NestJS service
import { AiClientService } from './ai-integration/ai-client.service';

@Injectable()
export class MyService {
  constructor(private aiClient: AiClientService) {}

  async analyzeResume(content: string) {
    try {
      const result = await this.aiClient.analyzeResumeText(content);
      return result;
    } catch (error) {
      // AI service unavailable - handle gracefully
      return { error: 'AI service temporarily unavailable' };
    }
  }
}
```

### Health Checking

```typescript
// Check AI service health
import { AiHealthService } from './ai-integration/ai-health.service';

const health = await this.aiHealthService.getDetailedHealthStatus();
console.log('AI Services Status:', health);
```

## 🚀 Production Deployment

For production, you have options:

### Option 1: Integrated (Simple)
```bash
# Build and start with integrated AI services
npm run build
npm run start:prod
```

### Option 2: Containerized (Scalable)
```bash
# Use Docker Compose for production
docker-compose up -d
```

### Option 3: Separate Deployment
```bash
# Disable integrated management in production
MANAGE_AI_SERVICES=false npm run start:prod

# Deploy AI services separately
python3 -m uvicorn main:app --host 0.0.0.0 --port 8001
```

## 💡 Tips & Best Practices

1. **Development**: Use integrated mode (`npm run start:dev`)
2. **Testing**: Use `npm run setup:ai` to verify setup
3. **Production**: Consider Docker Compose for scalability
4. **Monitoring**: Use health endpoints for service monitoring
5. **Updates**: Re-run `npm run setup:ai` after updating AI service dependencies

## 🎉 Success Indicators

When everything is working correctly, you'll see:

```
[Nest] LOG [AiProcessManagerService] Starting integrated AI services management...
[Nest] LOG [AiProcessManagerService] ✅ resume-analyzer started successfully (PID: 12345)
[Nest] LOG [AiProcessManagerService] ✅ job-matcher started successfully (PID: 12346)
[Nest] LOG [AiHealthService] 🎉 All AI services are healthy and ready!
[Nest] LOG [AiHealthService] ✅ AI services initialization completed successfully
```

Your CareerBuddy application is now running with fully integrated AI services! 🎉
