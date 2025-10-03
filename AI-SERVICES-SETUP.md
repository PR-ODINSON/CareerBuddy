# AI Services Setup Guide

This guide explains how to set up and run the AI services (Resume Analyzer and Job Matcher) with the CareerBuddy backend.

## Overview

CareerBuddy includes two AI microservices:

1. **Resume Analyzer** (Port 8001) - Analyzes resumes, extracts data, provides ATS scoring and feedback
2. **Job Matcher** (Port 8002) - Matches candidates with jobs, provides recommendations and market insights

## Quick Start

### Option 1: Automatic Startup (Recommended)

The backend can automatically start AI services for you:

```bash
# Navigate to backend directory
cd backend

# Start backend with AI services
npm run start:with-ai
```

This script will:
- Check if AI services are running
- Start them via Docker Compose if needed
- Wait for services to be healthy
- Start the backend with full AI integration

### Option 2: Manual Docker Compose

Start all services at once:

```bash
# From project root
docker-compose up -d

# Or start just AI services
docker-compose up -d resume-analyzer job-matcher
```

### Option 3: AI Services Only

Start just the AI services:

```bash
# From ai-services directory
cd ai-services
docker-compose up -d
```

## Service Health Checking

### Backend Health Endpoint

The backend provides health endpoints to monitor AI services:

```bash
# Check overall health including AI services
curl http://localhost:3001/health

# Check only AI services health
curl http://localhost:3001/health/ai
```

### Direct Service Health Checks

```bash
# Resume Analyzer
curl http://localhost:8001/health

# Job Matcher
curl http://localhost:8002/health
```

## Environment Variables

Configure AI service URLs in your backend environment:

```env
# Backend .env file
AI_RESUME_ANALYZER_URL=http://localhost:8001
AI_JOB_MATCHER_URL=http://localhost:8002

# For Docker environment
AI_RESUME_ANALYZER_URL=http://resume-analyzer:8001
AI_JOB_MATCHER_URL=http://job-matcher:8002
```

## Service Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│   Frontend      │◄──►│     Backend      │◄──►│  AI Services    │
│   (Port 3000)   │    │   (Port 3001)    │    │  (Ports 8001-2) │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │                  │
                       │    MongoDB       │
                       │   (Port 27017)   │
                       │                  │
                       └──────────────────┘
```

## AI Service Features

### Resume Analyzer (8001)

**Endpoints:**
- `POST /analyze/text` - Analyze resume text content
- `POST /extract/skills` - Extract skills from resume
- `POST /optimize/keywords` - Optimize resume for ATS
- `GET /health` - Service health check

**Capabilities:**
- Parse PDF, DOC, DOCX files
- Extract structured data (contact, experience, education, skills)
- ATS scoring and optimization
- Content feedback and suggestions
- Keyword matching and recommendations

### Job Matcher (8002)

**Endpoints:**
- `POST /match/jobs` - Find matching jobs for a candidate
- `POST /recommendations` - Generate job recommendations
- `POST /analyze/skills-gap` - Analyze skills gaps
- `POST /predict/job-fit` - Predict job fit score
- `GET /insights/market-trends` - Get market trends
- `GET /health` - Service health check

**Capabilities:**
- Intelligent job matching based on skills and preferences
- Skills gap analysis and recommendations
- Market trend analysis
- Job fit prediction with confidence scoring
- Personalized learning path suggestions

## Development Setup

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for backend)
- Python 3.9+ (for AI services development)

### Local Development

1. **Start AI Services:**
   ```bash
   cd ai-services
   docker-compose up -d
   ```

2. **Verify Services:**
   ```bash
   curl http://localhost:8001/health
   curl http://localhost:8002/health
   ```

3. **Start Backend:**
   ```bash
   cd backend
   npm run start:dev
   ```

4. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

## Troubleshooting

### Common Issues

#### 1. AI Services Not Starting

**Symptoms:** Backend shows AI services as unhealthy

**Solutions:**
```bash
# Check Docker is running
docker --version

# Check port availability
netstat -an | grep "8001\|8002"

# Check Docker Compose logs
docker-compose logs resume-analyzer
docker-compose logs job-matcher

# Restart services
docker-compose down
docker-compose up -d
```

#### 2. Port Conflicts

**Symptoms:** Services fail to start with port binding errors

**Solutions:**
```bash
# Check what's using the ports
lsof -i :8001
lsof -i :8002

# Stop conflicting processes or change ports in docker-compose.yml
```

#### 3. Network Issues

**Symptoms:** Backend can't reach AI services

**Solutions:**
```bash
# Check Docker network
docker network ls
docker network inspect careerbuddy_network

# Verify service connectivity
docker exec careerbuddy_backend curl http://resume-analyzer:8001/health
```

#### 4. Memory Issues

**Symptoms:** AI services crash or perform poorly

**Solutions:**
```bash
# Increase Docker memory limit (minimum 4GB recommended)
# Check memory usage
docker stats

# Restart with more memory
docker-compose down
docker-compose up -d
```

### Debug Commands

```bash
# View all running containers
docker ps

# Check service logs
docker-compose logs -f resume-analyzer
docker-compose logs -f job-matcher

# Access service containers
docker exec -it careerbuddy_resume_analyzer bash
docker exec -it careerbuddy_job_matcher bash

# Test API endpoints directly
curl -X POST http://localhost:8001/analyze/text \
  -H "Content-Type: application/json" \
  -d '{"content": "Test resume content"}'
```

## Production Deployment

### Environment Configuration

```env
# Production environment variables
NODE_ENV=production
AI_RESUME_ANALYZER_URL=http://resume-analyzer:8001
AI_JOB_MATCHER_URL=http://job-matcher:8002

# Resource limits
RESUME_ANALYZER_MEMORY=2g
JOB_MATCHER_MEMORY=2g
```

### Resource Requirements

- **Minimum:** 4GB RAM, 2 CPU cores
- **Recommended:** 8GB RAM, 4 CPU cores
- **Storage:** 10GB for Docker images and temporary files

### Monitoring

Set up monitoring for:
- Service health endpoints
- Response times
- Error rates
- Resource usage (CPU, memory)
- Docker container status

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Review Docker Compose logs
3. Ensure all prerequisites are installed
4. Verify network connectivity between services

The backend includes comprehensive health checking and will provide detailed error messages if AI services are not available.
