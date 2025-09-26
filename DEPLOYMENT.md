# CareerBuddy Deployment Guide

## Architecture Overview

CareerBuddy consists of four main services:

1. **Frontend** (Next.js) - Port 3000
2. **Backend** (NestJS) - Port 3001  
3. **Resume Analyzer AI** (Python FastAPI) - Port 8001
4. **Job Matcher AI** (Python FastAPI) - Port 8002
5. **MongoDB Database** - Port 27017

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for AI services development)
- At least 8GB RAM (recommended 16GB)
- 10GB free disk space

## Quick Start (Docker)

1. **Clone and setup environment:**
   ```bash
   git clone <repository>
   cd careerbuddy
   cp env.example .env
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Wait for services to be ready:**
   ```bash
   # Check service health
   curl http://localhost:3001/api/health  # Backend
   curl http://localhost:8001/health      # Resume Analyzer
   curl http://localhost:8002/health      # Job Matcher
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api
   - API Documentation: http://localhost:3001/api/docs
   - Resume Analyzer: http://localhost:8001
   - Job Matcher: http://localhost:8002

## Environment Configuration

### Backend (.env)
```env
# Database
DATABASE_URL="mongodb://careerbuddy:password@mongodb:27017/careerbuddy_db?authSource=admin"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# API URLs
FRONTEND_URL="http://localhost:3000"
AI_RESUME_ANALYZER_URL="http://resume-analyzer:8001"
AI_JOB_MATCHER_URL="http://job-matcher:8002"

# File Upload
MAX_FILE_SIZE="5MB"
UPLOAD_PATH="./uploads"

# Email (for production)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

## Development Setup

### Backend Development
```bash
cd backend
npm install
npm run start:dev
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### AI Services Development

#### Resume Analyzer
```bash
cd ai-services/resume-analyzer
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python main.py
```

#### Job Matcher
```bash
cd ai-services/job-matcher
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python main.py
```

## API Documentation

### Backend API
- **Base URL:** http://localhost:3001/api
- **Swagger Documentation:** http://localhost:3001/api/docs

### Key Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh JWT token

#### Resume Management
- `GET /api/resumes` - Get user resumes
- `POST /api/resumes/upload` - Upload resume file
- `POST /api/resumes/:id/analyze` - Analyze resume with AI
- `PUT /api/resumes/:id/set-active` - Set primary resume
- `DELETE /api/resumes/:id` - Delete resume

#### Job Management
- `GET /api/jobs` - Get jobs with filters
- `GET /api/jobs/search` - Advanced job search
- `GET /api/jobs/recommendations` - AI-powered recommendations
- `POST /api/jobs` - Create job posting (admin/counselor)

#### Applications
- `GET /api/applications` - Get user applications
- `POST /api/applications` - Apply for job
- `GET /api/applications/stats` - Application statistics
- `GET /api/applications/interviews/upcoming` - Upcoming interviews

#### Admin Dashboard
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/analytics/users` - User analytics
- `GET /api/admin/analytics/resumes` - Resume analytics
- `GET /api/admin/analytics/jobs` - Job analytics

### AI Services API

#### Resume Analyzer (Port 8001)
- `POST /analyze/file` - Analyze uploaded resume file
- `POST /analyze/text` - Analyze resume text content
- `POST /extract/skills` - Extract skills from resume
- `POST /optimize/keywords` - Optimize keywords for job description

#### Job Matcher (Port 8002)
- `POST /match/jobs` - Find matching jobs for user
- `POST /recommendations` - Get personalized recommendations
- `POST /analyze/skills-gap` - Analyze skills gap
- `POST /predict/job-fit` - Predict job fit score
- `GET /insights/market-trends` - Get market trends

## Database Schema

### Collections

#### Users
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String,
  firstName: String,
  lastName: String,
  role: "STUDENT" | "COUNSELOR" | "ADMIN",
  isActive: Boolean,
  isVerified: Boolean,
  // Student-specific fields
  university: String,
  major: String,
  graduationYear: Number,
  skills: [String],
  targetRoles: [String],
  preferredIndustries: [String],
  locationPreferences: [String],
  salaryExpectation: Number,
  // Counselor-specific fields
  specialization: [String],
  experience: Number,
  certification: String,
  rating: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### Jobs
```javascript
{
  _id: ObjectId,
  title: String,
  company: String,
  description: String,
  requirements: [String],
  skills: [String],
  location: String,
  locationType: "REMOTE" | "ONSITE" | "HYBRID",
  experienceLevel: "ENTRY" | "JUNIOR" | "MID" | "SENIOR" | "LEAD",
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP",
  salaryMin: Number,
  salaryMax: Number,
  isActive: Boolean,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date,
  expiresAt: Date
}
```

#### Resumes
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  title: String,
  fileName: String,
  filePath: String,
  fileSize: Number,
  mimeType: String,
  content: Object, // Parsed content from AI
  skills: [String],
  experience: Object,
  education: Object,
  isActive: Boolean,
  version: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### Applications
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  jobId: ObjectId,
  resumeId: ObjectId,
  status: "APPLIED" | "REVIEWING" | "INTERVIEW" | "OFFER" | "REJECTED",
  coverLetter: String,
  notes: String,
  appliedAt: Date,
  updatedAt: Date
}
```

## Monitoring and Health Checks

### Service Health Endpoints
- Backend: `GET /api/health`
- Resume Analyzer: `GET /health`
- Job Matcher: `GET /health`
- MongoDB: Connection check via backend

### Docker Health Checks
All services include health checks that run every 30 seconds.

### Logging
- Backend: Winston logger with configurable levels
- AI Services: Python logging module
- Frontend: Next.js built-in logging

## Security Features

### Authentication & Authorization
- JWT tokens with configurable expiration
- Role-based access control (Student, Counselor, Admin)
- Password hashing with bcrypt
- Input validation with class-validator

### File Upload Security
- File type validation (PDF, DOCX, TXT only)
- File size limits (5MB max)
- Unique file naming to prevent conflicts
- Secure file storage outside web root

### API Security
- CORS configuration
- Request rate limiting (production)
- Input sanitization
- SQL injection prevention (MongoDB)

## Performance Optimization

### Caching
- MongoDB query optimization with indexes
- File upload caching
- API response caching (production)

### AI Services
- Model caching for faster responses
- Asynchronous processing for large files
- Request queuing for high loads

### Database
- Proper indexing on frequently queried fields
- Connection pooling
- Query optimization

## Troubleshooting

### Common Issues

#### Services Not Starting
```bash
# Check Docker logs
docker-compose logs [service-name]

# Check service health
curl http://localhost:[port]/health
```

#### AI Services Connection Issues
```bash
# Verify AI services are running
docker ps | grep careerbuddy

# Check network connectivity
docker network ls
docker network inspect careerbuddy_network
```

#### Database Connection Issues
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Test connection
docker-compose exec mongodb mongosh careerbuddy_db
```

#### File Upload Issues
- Check file size (max 5MB)
- Verify file type (PDF, DOCX, TXT only)
- Ensure uploads directory has write permissions

### Performance Issues
- Monitor memory usage with `docker stats`
- Check AI service response times
- Optimize database queries with explain()

## Production Deployment

### Environment Variables
- Change JWT_SECRET to a strong, unique value
- Configure SMTP settings for email notifications
- Set NODE_ENV=production
- Configure proper CORS origins

### Security Hardening
- Use HTTPS with SSL certificates
- Implement rate limiting
- Add API authentication for AI services
- Regular security updates

### Scaling
- Use Docker Swarm or Kubernetes for orchestration
- Implement load balancing for backend services
- Add Redis for session storage and caching
- Use MongoDB replica sets for high availability

### Monitoring
- Set up application monitoring (e.g., New Relic, DataDog)
- Configure log aggregation (e.g., ELK stack)
- Set up alerts for service failures
- Monitor disk space and memory usage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and add tests
4. Submit a pull request

## License

MIT License - see LICENSE file for details
