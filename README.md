# CareerBuddy - AI-Powered Career Guidance Platform

> **A comprehensive SaaS platform that empowers students with AI-driven career guidance, intelligent resume optimization, and personalized job matching, while enabling counselors to provide effective mentorship and administrators to manage the entire ecosystem.**

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black?logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0-red?logo=nestjs)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-green?logo=mongodb)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://www.docker.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-black?logo=socket.io)](https://socket.io/)

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Live Demo & Credentials](#-live-demo--credentials)
- [Key Features](#-key-features)
- [User Roles & Capabilities](#-user-roles--capabilities)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Database Schema](#-database-schema)
- [Quick Start](#-quick-start)
- [Development Guide](#-development-guide)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

CareerBuddy is a full-stack, AI-powered career guidance platform designed to help students and young professionals navigate their career journey with confidence. The platform combines advanced AI capabilities with human mentorship to provide personalized resume optimization, intelligent job matching, and comprehensive career guidance.

### 🌟 The Problem We Solve

**For Students:**
- Difficulty creating ATS-optimized resumes that pass automated screening
- Finding relevant job opportunities matching skills and experience
- Lack of personalized career guidance and mentorship
- No centralized platform to track job applications and progress

**For Career Counselors:**
- Managing multiple students efficiently while providing personalized attention
- Tracking student progress and measuring counseling effectiveness
- Limited tools for providing structured feedback and guidance
- Difficulty scaling mentorship without compromising quality

**For Administrators:**
- Overseeing platform operations and ensuring quality
- Managing users, job postings, and content moderation
- Tracking platform metrics and measuring success
- Configuring system settings and features

### 💡 Our Solution

A unified, AI-powered platform that provides:

✅ **AI-Powered Resume Analysis** - Comprehensive ATS scoring and optimization  
✅ **Intelligent Job Matching** - Machine learning-based job recommendations  
✅ **Real-Time Communication** - WebSocket-powered notifications and messaging  
✅ **Role-Based Dashboards** - Customized experiences for students, counselors, and admins  
✅ **Comprehensive Analytics** - Track progress, measure success, and gain insights  
✅ **Scalable Architecture** - Built with modern technologies for growth and performance  

---

## 🔑 Live Demo & Credentials

### Test Accounts

**Admin Account:**
- Email: `admin@careerbuddy.com`
- Password: `admin123`
- Access: Full platform management and analytics

**Counselor Account:**
- Email: `counselor@careerbuddy.com`
- Password: `counselor123`
- Access: Student management and session scheduling

**Student Account:**
- Email: `student@careerbuddy.com`
- Password: `student123`
- Access: Resume building, job search, and applications

### Database
- MongoDB Atlas: `mongodb+srv://prithraj120_db_user:2hp6v5DySDDwG0Vn@cluster0.ih61mql.mongodb.net/`
- Pre-seeded with 50+ jobs, sample users, and test data

---

## ✨ Key Features

### 🎓 Student Features

#### **Resume Intelligence**
- 📄 **Multi-Format Upload** - Support for PDF, DOCX, DOC, and TXT files
- 🎯 **ATS Scoring** - Detailed scoring across 5 dimensions:
  - Formatting (structure, consistency, readability)
  - Content Quality (achievements, action verbs, quantified results)
  - Keyword Optimization (industry-specific terms, skill matching)
  - Section Completeness (contact, summary, experience, education, skills)
  - Readability (grammar, clarity, professional tone)
- 💡 **AI Feedback** - Actionable suggestions categorized by priority
- 📊 **Skills Extraction** - Automatic identification of technical and soft skills
- 🔄 **Version Control** - Track resume iterations and improvements
- ✅ **ATS Compatibility Check** - Ensure resumes pass automated screening

#### **Job Discovery & Matching**
- 🤖 **AI-Powered Recommendations** - Intelligent job matching based on:
  - Skills and experience level
  - Career goals and preferences
  - Location and salary expectations
  - Historical application success
- 🔍 **Advanced Search** - Filter by location, experience, employment type, salary
- 🏢 **Company Insights** - Detailed job descriptions and requirements
- 📱 **Real-Time Updates** - Instant notifications for new matching jobs
- 💼 **One-Click Apply** - Streamlined application process

#### **Application Tracking**
- 📋 **Status Dashboard** - Track all applications in one place
- 🔔 **Status Updates** - Real-time notifications on application progress
- 📅 **Interview Management** - Schedule and track interviews
- 📊 **Success Analytics** - Measure application success rates
- 📝 **Cover Letter Storage** - Save and reuse cover letters

#### **Career Guidance**
- 👨‍🏫 **Counselor Assignment** - Matched with career counselors by field
- 💬 **Real-Time Chat** - WebSocket-powered instant messaging
- 📈 **Progress Tracking** - Visual dashboards showing skill development
- 🎯 **Skills Gap Analysis** - Identify areas for improvement
- 🛤️ **Career Path Recommendations** - AI-generated career trajectories

---

### 👨‍🏫 Counselor Features

#### **Student Management**
- 👥 **Student Portfolio** - Comprehensive profiles of assigned students
- 📊 **Progress Dashboard** - Track student development metrics
- 📄 **Resume Access** - Review and provide feedback on resumes
- 🎯 **Goal Tracking** - Monitor student career objectives
- 📈 **Performance Analytics** - Detailed student progress reports

#### **Session Management**
- 📅 **Scheduling System** - Flexible appointment booking
- 🔔 **Reminders** - Automated session notifications
- 📝 **Session Notes** - Document discussions and action items
- ⏱️ **Time Tracking** - Monitor counseling time investment
- 📊 **Session Analytics** - Measure session effectiveness

#### **Communication & Feedback**
- 💬 **Real-Time Messaging** - Instant communication with students
- 📧 **Email Integration** - Send updates and announcements
- 📝 **Structured Feedback** - Templated feedback forms
- 🎯 **Action Plans** - Create and track student action items
- 📄 **Progress Reports** - Generate detailed student reports

#### **Analytics & Insights**
- 📊 **Performance Metrics** - Track counselor effectiveness
- 👥 **Student Success Rates** - Monitor placement and progress
- ⏰ **Session Statistics** - Analyze time and resource allocation
- 📈 **Trend Analysis** - Identify patterns and opportunities
- 📥 **Export Capabilities** - Download reports in PDF format

---

### 👨‍💼 Admin Features

#### **User Management**
- 👤 **Complete CRUD** - Create, read, update, delete all users
- 🎭 **Role Assignment** - Manage Student, Counselor, and Admin roles
- ✅ **Account Activation** - Approve/deactivate user accounts
- 🔍 **User Search** - Advanced filtering and search capabilities
- 📊 **User Analytics** - Track user growth and engagement
- 👥 **Bulk Operations** - Manage multiple users efficiently

#### **Job Management**
- 💼 **Full Job Control** - Create, edit, delete job postings
- 📝 **Detailed Descriptions** - Rich job information including:
  - Requirements and qualifications
  - Benefits and perks
  - Company information
  - Salary ranges
- 🔍 **Advanced Filters** - Filter by location, type, experience, status
- ✅ **Job Moderation** - Approve/reject job submissions
- ⏰ **Expiration Management** - Automatic job expiration
- 📊 **Job Analytics** - Track application rates and success

#### **Platform Analytics**
- 📊 **Dashboard Overview** - Real-time platform statistics
- 📈 **User Analytics** - Growth trends and engagement metrics
- 💼 **Job Analytics** - Posting performance and application rates
- 📄 **Resume Analytics** - Upload and analysis statistics
- 🎓 **University Insights** - Top universities by student count
- 📥 **Data Export** - Generate comprehensive reports

#### **System Configuration**
- ⚙️ **General Settings** - Site name, description, branding
- 📧 **Email Configuration** - SMTP settings for notifications
- 🔒 **Security Policies** - Password requirements, session management
- 🎚️ **Feature Toggles** - Enable/disable platform features
- 📏 **System Limits** - Configure usage quotas and rate limits
- 🛠️ **Maintenance Mode** - Platform-wide maintenance controls

#### **Real-Time Notifications**
- 🔔 **Notification System** - Send announcements to all users
- 🎯 **Targeted Messaging** - Role-based notifications
- 📱 **WebSocket Integration** - Instant delivery
- 📊 **Notification Analytics** - Track delivery and engagement

---

## 👥 User Roles & Capabilities

### **🎓 STUDENT** (Primary Users)

**Core Capabilities:**
- Create and manage professional profiles
- Upload and optimize resumes with AI assistance
- Browse and apply to job opportunities
- Track application status and progress
- Communicate with assigned career counselors
- Access career guidance and resources
- Take skill assessments
- View personalized job recommendations

**Key Pages:**
- `/dashboard` - Student overview and quick stats
- `/dashboard/profile` - Profile management and settings
- `/dashboard/resumes` - Resume creation and management
- `/dashboard/resumes/analysis/[id]` - AI resume analysis results
- `/dashboard/jobs` - Job discovery and search
- `/dashboard/applications` - Application tracking

**User Journey:**
1. **Registration & Setup** → Complete profile → Upload resume
2. **Resume Optimization** → AI analysis → Implement suggestions
3. **Job Discovery** → Browse recommendations → Apply to jobs
4. **Counselor Engagement** → Get assigned → Regular check-ins
5. **Progress Tracking** → Monitor applications → Career advancement

---

### **👨‍🏫 COUNSELOR** (Career Advisors)

**Core Capabilities:**
- Manage assigned student portfolios
- Review and provide feedback on resumes
- Schedule and conduct counseling sessions
- Track student progress and goals
- Provide career guidance and resources
- Generate progress reports
- Communicate via real-time chat
- Access student analytics

**Key Pages:**
- `/counselor` - Counselor dashboard with student overview
- `/counselor/students` - Assigned students management
- `/counselor/sessions` - Session scheduling and tracking
- `/counselor/feedback` - Student feedback and reports
- `/counselor/analytics` - Performance metrics and insights

**Workflow:**
1. **Student Assignment** → Review profiles → Initial assessment
2. **Goal Setting** → Career planning → Milestone definition
3. **Regular Mentoring** → Sessions → Progress reviews
4. **Resource Sharing** → Skills gap analysis → Recommendations
5. **Success Tracking** → Monitor achievements → Report outcomes

---

### **👨‍💼 ADMIN** (Platform Managers)

**Core Capabilities:**
- Full user account management
- Complete job posting control with detailed descriptions
- Platform-wide analytics and reporting
- System configuration and settings
- Content moderation and quality control
- Send platform-wide announcements
- Monitor system health and performance
- Manage counselor assignments

**Key Pages:**
- `/admin` - Admin dashboard with platform analytics
- `/admin/users` - User management interface
- `/admin/jobs` - Job management with full descriptions
- `/admin/analytics` - Comprehensive platform analytics
- `/admin/settings` - System configuration panel

**Responsibilities:**
1. **Platform Oversight** → Monitor health → Review metrics
2. **User Management** → Approve accounts → Handle escalations
3. **Content Moderation** → Review jobs → Ensure quality
4. **System Configuration** → Update settings → Deploy features
5. **Analytics & Reporting** → Generate insights → Data-driven decisions

---

## 🛠️ Tech Stack

### **Frontend**

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.0 | React framework with App Router and SSR |
| **TypeScript** | 5.2 | Type-safe JavaScript development |
| **TailwindCSS** | 3.3 | Utility-first CSS framework |
| **shadcn/ui** | Latest | Accessible component library built on Radix UI |
| **React Query** | 5.0 | Server state management and caching |
| **Zustand** | 4.4 | Lightweight client state management |
| **Socket.io Client** | 4.8 | Real-time WebSocket communication |
| **React Hook Form** | 7.47 | Form handling and validation |
| **Zod** | 3.22 | Schema validation |
| **Recharts** | 3.3 | Data visualization and charts |
| **Framer Motion** | 12.23 | Animation library |
| **Lucide React** | Latest | Icon library |
| **Axios** | 1.5 | HTTP client |

### **Backend**

| Technology | Version | Purpose |
|------------|---------|---------|
| **NestJS** | 10.0 | Progressive Node.js framework |
| **TypeScript** | 5.1 | Type-safe backend development |
| **Mongoose** | 8.18 | MongoDB object modeling |
| **MongoDB** | 8.0 | NoSQL database |
| **Socket.io** | 4.8 | WebSocket server for real-time features |
| **Passport** | 0.6 | Authentication middleware |
| **JWT** | 10.1 | JSON Web Token authentication |
| **Bcrypt** | 2.4 | Password hashing |
| **Multer** | 1.4 | File upload handling |
| **Swagger** | 7.4 | API documentation |
| **Class Validator** | 0.14 | DTO validation |
| **Class Transformer** | 0.5 | Object transformation |
| **PDF Parse** | 1.1 | PDF document parsing |
| **Mammoth** | 1.11 | DOCX document parsing |
| **Axios** | 1.12 | HTTP client |

### **DevOps & Tools**

| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **Git** | Version control |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Jest** | Testing framework |

---

## 🏛️ System Architecture

### **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                       CLIENT LAYER                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Next.js 14 Frontend (Port 3000)            │  │
│  │  - App Router with SSR                               │  │
│  │  - React Query for data fetching                     │  │
│  │  - Socket.io client for real-time updates            │  │
│  │  - Role-based routing and components                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          NestJS Backend API (Port 3001)              │  │
│  │  - RESTful API with Swagger docs                     │  │
│  │  - JWT authentication & role-based guards            │  │
│  │  - WebSocket gateway for notifications               │  │
│  │  - File upload handling (resumes)                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                             │
│  ┌──────────────┬──────────────┬──────────────────────┐    │
│  │    Auth      │    Users     │     Resumes          │    │
│  │   Service    │   Service    │     Service          │    │
│  └──────────────┴──────────────┴──────────────────────┘    │
│  ┌──────────────┬──────────────┬──────────────────────┐    │
│  │    Jobs      │ Applications │    Counselor         │    │
│  │   Service    │   Service    │     Service          │    │
│  └──────────────┴──────────────┴──────────────────────┘    │
│  ┌──────────────┬──────────────┬──────────────────────┐    │
│  │    Admin     │      AI      │   Notifications      │    │
│  │   Service    │ Integration  │     Service          │    │
│  └──────────────┴──────────────┴──────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        MongoDB Database (Port 27017)                 │  │
│  │  - User collection (students, counselors, admins)    │  │
│  │  - Jobs collection (postings, details)               │  │
│  │  - Resumes collection (files, analysis)              │  │
│  │  - Applications collection (tracking)                │  │
│  │  - Notifications collection (real-time)              │  │
│  │  - Sessions collection (counseling)                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    AI SERVICES                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Built-in AI Service (NestJS)               │  │
│  │  - Resume parsing and analysis                       │  │
│  │  - ATS scoring algorithm                             │  │
│  │  - Skills extraction                                 │  │
│  │  - Job matching algorithm                            │  │
│  │  - Keyword optimization                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### **Data Flow**

1. **Authentication Flow**
   ```
   User Login → Frontend → Backend Auth Service → JWT Generation
   → Store in localStorage → Attach to API requests → Validate with Guards
   ```

2. **Resume Analysis Flow**
   ```
   Upload Resume → Multer (File Processing) → AI Service (Analysis)
   → Store Results in DB → Notify User via WebSocket → Display in UI
   ```

3. **Job Matching Flow**
   ```
   User Profile + Resume → AI Matching Service → Calculate Scores
   → Rank Jobs → Return Top Matches → Display in UI
   ```

4. **Real-Time Notification Flow**
   ```
   Event Trigger → Notification Service → WebSocket Gateway
   → Emit to User Room → Frontend Socket Client → Toast Display
   ```

---

## 🗄️ Database Schema

### **User Collection**

```typescript
{
  _id: ObjectId,
  email: string (unique, required),
  password: string (hashed, required),
  firstName: string (required),
  lastName: string (required),
  role: 'STUDENT' | 'COUNSELOR' | 'ADMIN' (required),
  isActive: boolean (default: true),
  isVerified: boolean (default: false),
  avatar?: string,
  phone?: string,
  bio?: string,
  
  // Student-specific fields
  university?: string,
  major?: string,
  graduationYear?: number,
  gpa?: number (0-4.0),
  linkedinUrl?: string,
  githubUrl?: string,
  portfolioUrl?: string,
  targetRoles?: string[],
  preferredIndustries?: string[],
  locationPreferences?: string[],
  salaryExpectation?: number,
  
  // Counselor-specific fields
  specialization?: string[],
  experience?: number,
  certification?: string,
  rating?: number,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  lastLogin?: Date
}
```

### **Job Collection**

```typescript
{
  _id: ObjectId,
  title: string (required),
  company: string (required),
  description: string (required),
  requirements: string[],
  skills: string[],
  benefits?: string[],
  department?: string,
  
  location: string (required),
  locationType: 'REMOTE' | 'ONSITE' | 'HYBRID' (required),
  
  experienceLevel: 'ENTRY' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE' (required),
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE' (required),
  
  salaryMin?: number,
  salaryMax?: number,
  
  isActive: boolean (default: true),
  externalUrl?: string,
  source?: string,
  
  createdBy: ObjectId (ref: User, required),
  expiresAt?: Date,
  
  createdAt: Date,
  updatedAt: Date
}
```

### **Resume Collection**

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  
  title: string,
  fileName: string (required),
  filePath: string (required),
  fileSize: number,
  mimeType: string,
  
  // Parsed content from AI
  content: {
    rawText: string,
    sections: object,
    contact: object,
    summary?: string,
    experience?: object[],
    education?: object[],
    projects?: object[],
    certifications?: object[]
  },
  
  // Analysis results
  skills: string[],
  experience_years: number,
  ats_score: number,
  detailed_scores: {
    formatting: number,
    content_quality: number,
    keyword_optimization: number,
    section_completeness: number,
    readability: number
  },
  feedback: {
    strengths: string[],
    improvements: string[],
    suggestions: string[],
    critical_issues: string[]
  },
  
  isActive: boolean (default: false),
  version: number (default: 1),
  
  createdAt: Date,
  updatedAt: Date
}
```

### **Application Collection**

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  jobId: ObjectId (ref: Job, required),
  resumeId?: ObjectId (ref: Resume),
  
  status: 'APPLIED' | 'REVIEWING' | 'PHONE_SCREEN' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'WITHDRAWN' (required),
  
  coverLetter?: string,
  notes?: string,
  
  appliedAt: Date (default: now),
  createdAt: Date,
  updatedAt: Date
}
```

### **Notification Collection**

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  
  type: 'JOB_MATCH' | 'RESUME_ANALYSIS' | 'SESSION_REMINDER' | 'APPLICATION_UPDATE' | 'COUNSELOR_MESSAGE' | 'SYSTEM_ANNOUNCEMENT',
  
  title: string (required),
  message: string (required),
  data?: object,
  
  isRead: boolean (default: false),
  readAt?: Date,
  
  createdAt: Date
}
```

### **Interview Collection**

```typescript
{
  _id: ObjectId,
  applicationId: ObjectId (ref: Application, required),
  
  type: 'PHONE' | 'VIDEO' | 'ONSITE' | 'TECHNICAL' | 'BEHAVIORAL' | 'FINAL' (required),
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' (required),
  
  scheduledAt: Date (required),
  duration?: number,
  location?: string,
  
  interviewerName?: string,
  interviewerEmail?: string,
  
  notes?: string,
  feedback?: string,
  
  createdAt: Date,
  updatedAt: Date
}
```

### **CounselingSession Collection**

```typescript
{
  _id: ObjectId,
  counselorId: ObjectId (ref: User, required),
  studentId: ObjectId (ref: User, required),
  
  scheduledAt: Date (required),
  duration: number (default: 60),
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' (required),
  
  topic?: string,
  notes?: string,
  actionItems?: string[],
  feedback?: string,
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Quick Start

### **Prerequisites**

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MongoDB** 8.0+ or MongoDB Atlas account
- **Git** ([Download](https://git-scm.com/))
- **npm** or **yarn** package manager

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/PR-ODINSON/CareerBuddy.git
   cd CareerBuddy
   ```

2. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your configuration
   # Update MONGODB_URL with your MongoDB connection string
   ```

3. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

4. **Set up the database**
   ```bash
   # Navigate to backend directory
   cd backend
   
   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start the development servers**
   
   **Option A: Run separately (recommended for development)**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run start:dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```
   
   **Option B: Using Docker Compose**
   ```bash
   docker-compose up -d
   ```

6. **Access the application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:3001/api](http://localhost:3001/api)
   - API Documentation: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

### **Login with Test Accounts**

**Admin:**
```
Email: admin@careerbuddy.com
Password: admin123
```

**Counselor:**
```
Email: counselor@careerbuddy.com
Password: counselor123
```

**Student:**
```
Email: student@careerbuddy.com
Password: student123
```

---

## 💻 Development Guide

### **Backend Development**

```bash
cd backend

# Development mode with hot reload
npm run start:dev

# Production build
npm run build
npm run start:prod

# Run tests
npm run test
npm run test:watch
npm run test:cov

# Linting
npm run lint
npm run lint:fix

# Database operations
npm run db:seed          # Seed database with sample data
```

### **Frontend Development**

```bash
cd frontend

# Development mode
npm run dev

# Production build
npm run build
npm run start

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

### **Project Structure**

```
CareerBuddy/
├── backend/                          # NestJS Backend
│   ├── src/
│   │   ├── main.ts                  # Application entry point
│   │   ├── app.module.ts            # Root module
│   │   ├── swagger.config.ts        # API documentation config
│   │   │
│   │   ├── auth/                    # Authentication module
│   │   │   ├── auth.controller.ts   # Login, register endpoints
│   │   │   ├── auth.service.ts      # Auth business logic
│   │   │   ├── auth.module.ts
│   │   │   ├── strategies/          # JWT & Local strategies
│   │   │   ├── guards/              # Auth guards
│   │   │   └── dto/                 # Data transfer objects
│   │   │
│   │   ├── users/                   # User management module
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.module.ts
│   │   │   ├── schemas/             # Mongoose schemas
│   │   │   └── dto/
│   │   │
│   │   ├── resumes/                 # Resume management
│   │   │   ├── resumes.controller.ts
│   │   │   ├── resumes.service.ts
│   │   │   ├── resumes.module.ts
│   │   │   └── schemas/
│   │   │
│   │   ├── jobs/                    # Job management
│   │   │   ├── jobs.controller.ts
│   │   │   ├── jobs.service.ts
│   │   │   ├── jobs.module.ts
│   │   │   └── schemas/
│   │   │
│   │   ├── applications/            # Application tracking
│   │   │   ├── applications.controller.ts
│   │   │   ├── applications.service.ts
│   │   │   ├── applications.module.ts
│   │   │   └── schemas/
│   │   │
│   │   ├── admin/                   # Admin operations
│   │   │   ├── admin.controller.ts
│   │   │   ├── admin.service.ts
│   │   │   ├── admin.module.ts
│   │   │   └── dto/
│   │   │
│   │   ├── counselor/               # Counselor features
│   │   │   ├── counselor.controller.ts
│   │   │   ├── counselor.service.ts
│   │   │   ├── counselor.module.ts
│   │   │   └── dto/
│   │   │
│   │   ├── notifications/           # Real-time notifications
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts
│   │   │   ├── notifications.gateway.ts   # WebSocket
│   │   │   └── notifications.module.ts
│   │   │
│   │   ├── ai-integration/          # AI services
│   │   │   ├── ai-integration.module.ts
│   │   │   ├── built-in-ai.service.ts    # Resume analysis
│   │   │   ├── ai-client.service.ts
│   │   │   ├── ai-health.service.ts
│   │   │   └── ai-process-manager.service.ts
│   │   │
│   │   ├── database/                # Database configuration
│   │   │   └── database.module.ts
│   │   │
│   │   └── common/                  # Shared resources
│   │       └── schemas/             # Common schemas
│   │
│   ├── uploads/                     # Uploaded files
│   │   └── resumes/
│   ├── scripts/                     # Utility scripts
│   │   └── seed.ts                  # Database seeding
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
│
├── frontend/                         # Next.js Frontend
│   ├── src/
│   │   ├── app/                     # App Router pages
│   │   │   ├── layout.tsx           # Root layout
│   │   │   ├── page.tsx             # Home page
│   │   │   ├── globals.css
│   │   │   │
│   │   │   ├── auth/                # Authentication pages
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   │       ├── page.tsx     # Role selection
│   │   │   │       ├── student/     # Student registration
│   │   │   │       └── personal/    # Personal details
│   │   │   │
│   │   │   ├── dashboard/           # Student dashboard
│   │   │   │   ├── page.tsx         # Overview
│   │   │   │   ├── profile/         # Profile management
│   │   │   │   ├── resumes/         # Resume management
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── analysis/[id]/
│   │   │   │   ├── jobs/            # Job search
│   │   │   │   └── applications/    # Application tracking
│   │   │   │
│   │   │   ├── counselor/           # Counselor pages
│   │   │   │   ├── page.tsx         # Dashboard
│   │   │   │   ├── students/        # Student management
│   │   │   │   ├── sessions/        # Session scheduling
│   │   │   │   ├── feedback/        # Feedback management
│   │   │   │   └── analytics/       # Analytics
│   │   │   │
│   │   │   ├── admin/               # Admin pages
│   │   │   │   ├── page.tsx         # Dashboard
│   │   │   │   ├── users/           # User management
│   │   │   │   ├── jobs/            # Job management
│   │   │   │   ├── analytics/       # Platform analytics
│   │   │   │   └── settings/        # System settings
│   │   │   │
│   │   │   ├── contact/
│   │   │   ├── privacy/
│   │   │   └── terms/
│   │   │
│   │   ├── components/              # React components
│   │   │   ├── ui/                  # shadcn/ui components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   └── ...
│   │   │   ├── dashboard/           # Dashboard components
│   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   └── StatsCard.tsx
│   │   │   └── charts/              # Chart components
│   │   │
│   │   ├── lib/                     # Utilities
│   │   │   ├── api-client.ts        # API client with axios
│   │   │   ├── auth-context.tsx     # Authentication context
│   │   │   ├── react-query.tsx      # React Query provider
│   │   │   └── utils.ts             # Helper functions
│   │   │
│   │   └── hooks/                   # Custom React hooks
│   │       ├── useApi.ts
│   │       └── use-toast.ts
│   │
│   ├── public/                      # Static assets
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── postcss.config.js
│
├── docker-compose.yml               # Docker orchestration
├── env.example                      # Environment variables template
├── package.json                     # Root package.json
├── .gitignore
├── README.md                        # This file
├── DEVELOPMENT.md                   # Development guide
├── DEPLOYMENT.md                    # Deployment instructions
├── USER_FLOW_DOCUMENTATION.md       # User workflows
├── IMPLEMENTATION_SUMMARY.md        # Implementation details
├── ADMIN_SETUP.md                   # Admin setup guide
└── DATABASE_CONNECTION_TEST.md      # Database testing
```

---

## 📚 API Documentation

### **Base URL**
```
http://localhost:3001/api
```

### **Swagger Documentation**
```
http://localhost:3001/api/docs
```

### **Authentication**

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### **Key Endpoints**

#### **Authentication**
```http
POST   /auth/register          # User registration
POST   /auth/login             # User login
GET    /auth/profile           # Get current user profile
POST   /auth/refresh           # Refresh access token
```

#### **Users**
```http
GET    /users/me               # Get own profile
PUT    /users/me               # Update own profile
GET    /users                  # List users (admin only)
```

#### **Resumes**
```http
GET    /resumes                # Get user resumes
POST   /resumes/upload         # Upload resume file
POST   /resumes/:id/analyze    # Analyze resume with AI
GET    /resumes/:id/analysis   # Get analysis results
PUT    /resumes/:id/set-active # Set as primary resume
DELETE /resumes/:id            # Delete resume
```

#### **Jobs**
```http
GET    /jobs                   # List jobs with filters
GET    /jobs/search            # Advanced job search
GET    /jobs/recommendations   # AI job recommendations
POST   /jobs/recommendations   # Resume-based recommendations
GET    /jobs/:id               # Get job details
POST   /jobs                   # Create job (admin/counselor)
PUT    /jobs/:id               # Update job (admin/counselor)
DELETE /jobs/:id               # Delete job (admin)
```

#### **Applications**
```http
GET    /applications           # Get user applications
POST   /applications           # Submit job application
GET    /applications/stats     # Application statistics
GET    /applications/interviews/upcoming  # Upcoming interviews
PUT    /applications/:id       # Update application
PUT    /applications/:id/withdraw  # Withdraw application
```

#### **Admin**
```http
GET    /admin/dashboard-stats  # Dashboard statistics
GET    /admin/analytics/users  # User analytics
GET    /admin/analytics/resumes # Resume analytics
GET    /admin/analytics/jobs   # Job analytics
GET    /admin/users            # All users with pagination
PUT    /admin/users/:id/activate    # Activate user
PUT    /admin/users/:id/deactivate  # Deactivate user
```

#### **Counselor**
```http
GET    /counselor/students     # Get assigned students
GET    /counselor/students/:id # Get student details
PUT    /counselor/students/:id/feedback  # Provide feedback
GET    /counselor/sessions     # Get counseling sessions
POST   /counselor/sessions     # Schedule new session
PUT    /counselor/sessions/:id # Update session
GET    /counselor/analytics/overview  # Dashboard stats
GET    /counselor/analytics/students  # Student analytics
```

#### **Notifications**
```http
GET    /notifications          # Get user notifications
GET    /notifications/stats    # Notification statistics
PUT    /notifications/:id/read # Mark as read
PUT    /notifications/read-all # Mark all as read
DELETE /notifications/:id      # Delete notification
POST   /notifications/announcement  # Send announcement (admin)
```

### **WebSocket Events**

Connect to: `ws://localhost:3001/notifications`

**Client Events:**
```javascript
// Connect to notifications
socket.on('connect', () => { });

// Receive notification
socket.on('notification', (notification) => { });

// Notification count update
socket.on('notification-count', (count) => { });
```

**Server Events:**
```javascript
// Join user room
socket.emit('join', userId);

// Leave user room
socket.emit('leave', userId);
```

---

## 🔒 Security

### **Authentication & Authorization**

- **JWT-based Authentication**: Secure token-based auth with configurable expiration
- **Password Hashing**: Bcrypt with 12 rounds for password security
- **Role-Based Access Control**: Student, Counselor, Admin roles with guards
- **Route Protection**: Frontend and backend route guards
- **Token Refresh**: Automatic token refresh mechanism

### **Data Protection**

- **Input Validation**: Class-validator for DTO validation
- **SQL Injection Prevention**: Mongoose ODM protection
- **XSS Prevention**: Input sanitization and output encoding
- **CORS Configuration**: Restricted cross-origin requests
- **File Upload Security**: 
  - File type validation (PDF, DOCX, DOC, TXT only)
  - File size limits (5MB max)
  - Secure file storage

### **API Security**

- **Rate Limiting**: Prevent abuse and DDoS attacks
- **HTTPS**: SSL/TLS encryption in production
- **Helmet**: Security headers configuration
- **CSRF Protection**: Cross-site request forgery prevention

### **Best Practices**

- Environment variables for sensitive data
- Secrets management with .env files
- Regular dependency updates
- Security audit logging
- Error handling without information leakage

---

## 🚢 Deployment

### **Environment Variables**

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URL="your_mongodb_connection_string"

# Server
NODE_ENV="production"
BACKEND_PORT=3001
FRONTEND_URL="https://your-domain.com"

# JWT
JWT_SECRET="your-strong-secret-key"
JWT_EXPIRATION="7d"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_REFRESH_EXPIRATION="30d"

# Email (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# File Upload
MAX_FILE_SIZE="5242880"
UPLOAD_PATH="./uploads"

# CORS
CORS_ORIGIN="https://your-domain.com"
```

### **Docker Deployment**

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d --build
   ```

2. **Stop services**
   ```bash
   docker-compose down
   ```

3. **View logs**
   ```bash
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

### **Production Deployment**

**Backend (NestJS)**
```bash
cd backend
npm run build
npm run start:prod
```

**Frontend (Next.js)**
```bash
cd frontend
npm run build
npm start
```

### **Deployment Platforms**

- **Vercel**: Frontend deployment (Next.js)
- **Heroku**: Backend deployment (NestJS)
- **Railway**: Full-stack deployment
- **DigitalOcean**: VPS hosting
- **AWS**: Elastic Beanstalk or EC2
- **MongoDB Atlas**: Database hosting

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### **Code Standards**

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📧 Contact & Support

- **Author**: PR-ODINSON
- **Repository**: [github.com/PR-ODINSON/CareerBuddy](https://github.com/PR-ODINSON/CareerBuddy)
- **Issues**: [GitHub Issues](https://github.com/PR-ODINSON/CareerBuddy/issues)

---

## 🙏 Acknowledgments

- **NestJS** - Progressive Node.js framework
- **Next.js** - The React framework for production
- **shadcn/ui** - Beautifully designed components
- **MongoDB** - Document database
- **Socket.io** - Real-time communication
- **TanStack Query** - Powerful data synchronization

---

## 📊 Project Status

✅ **Current Status**: Production Ready  
🚀 **Version**: 1.0.0  
📅 **Last Updated**: November 26, 2025  

### **Implemented Features**

- ✅ Complete authentication system with JWT
- ✅ Role-based access control (Student, Counselor, Admin)
- ✅ AI-powered resume analysis and ATS scoring
- ✅ Intelligent job matching algorithm
- ✅ Real-time notifications with WebSockets
- ✅ Comprehensive admin dashboard
- ✅ Counselor management system
- ✅ Student portfolio and progress tracking
- ✅ Application tracking system
- ✅ Session scheduling and management
- ✅ Analytics and reporting
- ✅ Responsive UI with TailwindCSS
- ✅ API documentation with Swagger
- ✅ Docker containerization
- ✅ MongoDB Atlas integration
- ✅ File upload and processing
- ✅ Email notifications (SMTP)

### **Future Enhancements**

- 🔮 Video call integration for counseling sessions
- 🔮 Advanced analytics with ML insights
- 🔮 Mobile application (React Native)
- 🔮 External job board integrations
- 🔮 Interview preparation AI assistant
- 🔮 Company partnership program
- 🔮 Advanced resume templates
- 🔮 Skills assessment tests
- 🔮 Career path recommendations
- 🔮 Group counseling features

---

<div align="center">

**Made with ❤️ by PR-ODINSON**

⭐ Star this repository if you find it helpful!

</div>