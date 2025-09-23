# CareerBuddy - AI-Powered Resume & Career Assistant Platform

A comprehensive platform that helps students build, optimize, and manage their resumes while providing personalized career guidance and job recommendations.

## Tech Stack

- **Frontend**: Next.js 14 + TypeScript + TailwindCSS + shadcn/ui
- **Backend**: NestJS + TypeScript + Prisma ORM
- **Database**: PostgreSQL 13+
- **Authentication**: JWT + Role-based access control
- **AI Integration**: Python services (REST APIs)

## Project Structure

```
careerbuddy/
├── frontend/          # Next.js application
├── backend/           # NestJS API server
├── docker-compose.yml # Development environment
└── README.md
```

## Quick Start

1. Clone the repository
2. Copy environment files: `cp .env.example .env`
3. Start development environment: `docker-compose up -d`
4. Access the application at `http://localhost:3000`

## Development

- Frontend: `cd frontend && npm run dev`
- Backend: `cd backend && npm run start:dev`
- Database: PostgreSQL runs on port 5432

## User Roles

- **Student**: Upload resumes, get feedback, search jobs, track applications
- **Counselor**: Review student resumes, provide feedback, manage sessions
- **Admin**: Platform management, analytics, user management
