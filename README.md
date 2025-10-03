# CareerBuddy - AI-Powered Resume & Career Assistant Platform

A comprehensive platform that helps students build, optimize, and manage their resumes while providing personalized career guidance and job recommendations powered by advanced AI technologies.

## ✨ Features

### 🎯 Core Features
- **Smart Resume Analysis**: AI-powered ATS compatibility scoring and optimization
- **Intelligent Job Matching**: Semantic job matching based on skills and preferences
- **Application Tracking**: Complete job application lifecycle management
- **Career Guidance**: Personalized recommendations and career path suggestions
- **Admin Analytics**: Comprehensive dashboard with user and platform insights

### 🤖 AI-Powered Capabilities
- **Resume Intelligence**: NLP-based parsing, skill extraction, and improvement suggestions
- **ATS Optimization**: Automated compatibility analysis with detailed feedback
- **Job Recommendations**: Machine learning-based personalized job suggestions
- **Skills Gap Analysis**: Identify missing skills and get learning recommendations
- **Market Insights**: Real-time job market trends and salary insights

### 👥 Multi-Role Support
- **Students**: Upload resumes, get AI feedback, search jobs, track applications
- **Career Counselors**: Review student profiles, provide guidance, manage sessions
- **Administrators**: Platform management, analytics, user oversight

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 + TypeScript + TailwindCSS + shadcn/ui
- **Backend**: NestJS + TypeScript + MongoDB + Mongoose
- **AI Services**: Built-in NestJS services with PDF parsing and text analysis
- **Database**: MongoDB 7.0+
- **Authentication**: JWT + Role-based access control
- **Container**: Docker + Docker Compose

### Service Architecture
```
careerbuddy/
├── frontend/                 # Next.js application (Port 3000)
├── backend/                 # NestJS API server (Port 3001)
│   └── ai-integration/      # Built-in AI services
├── docker-compose.yml       # Multi-service orchestration
└── DEPLOYMENT.md           # Comprehensive deployment guide
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB 7.0+
- At least 4GB RAM (recommended 8GB)
- 5GB free disk space

### 1. Clone and Setup
```bash
git clone <repository>
cd careerbuddy
cp env.example .env
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Start Services
```bash
# Start backend (from backend directory)
npm start

# Start frontend (from frontend directory)
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **API Documentation**: http://localhost:3001/api/docs

## 📚 API Documentation

### Backend API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration with email verification

#### Resume Management
- `GET /api/resumes` - List user resumes
- `POST /api/resumes/upload` - Upload resume file (PDF/DOCX/TXT)
- `POST /api/resumes/:id/analyze` - AI-powered resume analysis
- `PUT /api/resumes/:id/set-active` - Set primary resume

#### Job Management
- `GET /api/jobs` - Browse jobs with advanced filtering
- `GET /api/jobs/search` - Semantic job search
- `GET /api/jobs/recommendations` - AI-powered job recommendations

#### Application Tracking
- `GET /api/applications` - User applications with status tracking
- `POST /api/applications` - Apply for jobs
- `GET /api/applications/stats` - Application analytics

#### Admin Dashboard
- `GET /api/admin/dashboard` - Platform statistics
- `GET /api/admin/analytics/*` - Comprehensive analytics

### AI Services API

#### Resume Analyzer (Port 8001)
- `POST /analyze/file` - Upload and analyze resume file
- `POST /analyze/text` - Analyze resume text content
- `POST /extract/skills` - Extract and categorize skills
- `POST /optimize/keywords` - ATS keyword optimization

#### Job Matcher (Port 8002)
- `POST /match/jobs` - Find matching jobs for user profile
- `POST /recommendations` - Generate personalized recommendations
- `POST /analyze/skills-gap` - Skills gap analysis
- `GET /insights/market-trends` - Job market insights

## 🔧 Development

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
```bash
# Resume Analyzer
cd ai-services/resume-analyzer
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python main.py

# Job Matcher
cd ai-services/job-matcher
pip install -r requirements.txt
python main.py
```

## 📊 Database Schema

### MongoDB Collections
- **Users**: User profiles with role-based access (Student/Counselor/Admin)
- **Resumes**: Resume files with AI-parsed content and analysis
- **Jobs**: Job postings with detailed requirements and metadata
- **Applications**: Job applications with status tracking and interviews
- **Analytics**: User activity and platform usage statistics

## 🔒 Security Features

- **Authentication**: JWT tokens with configurable expiration
- **Authorization**: Role-based access control with guards
- **File Security**: Type validation, size limits, secure storage
- **Input Validation**: Comprehensive validation with class-validator
- **API Security**: CORS, rate limiting, input sanitization

## 📈 AI & Machine Learning

### Resume Intelligence Engine
- **NLP Processing**: Advanced text parsing and extraction
- **ATS Scoring**: Compatibility analysis with improvement suggestions
- **Skill Extraction**: Automatic categorization of technical and soft skills
- **Format Analysis**: Structure and readability optimization

### Job Matching Engine
- **Semantic Matching**: Skills and experience similarity analysis
- **Personalization**: Learning from user preferences and behavior
- **Market Analysis**: Real-time job market trends and insights
- **Career Pathways**: Intelligent career progression suggestions

## 📋 User Workflows

### Student Journey
1. **Registration**: Sign up with institutional affiliation
2. **Profile Setup**: Complete academic and career information
3. **Resume Upload**: Upload resume for AI analysis
4. **AI Feedback**: Receive detailed improvement suggestions
5. **Job Search**: Browse and search for relevant opportunities
6. **Applications**: Apply for jobs and track application status
7. **Analytics**: View application statistics and recommendations

### Counselor Workflow
1. **Student Management**: View and manage student profiles
2. **Resume Review**: Provide personalized feedback and guidance
3. **Session Scheduling**: Coordinate counseling sessions
4. **Progress Tracking**: Monitor student career development
5. **Resource Management**: Share learning resources and opportunities

### Admin Dashboard
1. **Platform Analytics**: Monitor user engagement and platform health
2. **User Management**: Oversee user accounts and permissions
3. **Content Moderation**: Review and approve job postings
4. **System Monitoring**: Track service health and performance
5. **Reporting**: Generate comprehensive platform reports

## 🚀 Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive production deployment guide including:
- Environment configuration
- Security hardening
- Performance optimization
- Monitoring and logging
- Scaling strategies

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test
npm run test:e2e

# Frontend tests
cd frontend
npm run test

# AI services tests
cd ai-services/resume-analyzer
python -m pytest

cd ai-services/job-matcher
python -m pytest
```

## 📖 Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete deployment guide
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development environment setup
- API Documentation: http://localhost:3001/api/docs (when running)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies and AI frameworks
- Designed for scalability and maintainability
- Focused on user experience and accessibility
- Comprehensive testing and documentation
