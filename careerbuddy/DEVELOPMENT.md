# CareerBuddy Development Guide

## 🚀 Quick Start

1. **Clone and Setup**
   ```bash
   cd careerbuddy
   chmod +x setup.sh
   ./setup.sh
   ```

2. **Start Development Environment**
   ```bash
   docker-compose up -d
   ```

3. **Initialize Database**
   ```bash
   cd backend
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api
   - API Health Check: http://localhost:3001/api/health

## 📁 Project Structure

```
careerbuddy/
├── backend/                 # NestJS API Server
│   ├── src/
│   │   ├── auth/           # Authentication & JWT
│   │   ├── users/          # User management
│   │   ├── resumes/        # Resume handling (stub)
│   │   ├── jobs/           # Job management (stub)
│   │   ├── applications/   # Application tracking (stub)
│   │   ├── admin/          # Admin features (stub)
│   │   └── prisma/         # Database service
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Sample data
│   └── package.json
├── frontend/               # Next.js Application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # Reusable components
│   │   ├── lib/           # Utilities & providers
│   │   └── hooks/         # Custom React hooks
│   └── package.json
├── docker-compose.yml      # Development environment
└── env.example            # Environment variables template
```

## 🔧 Development Workflow

### Backend Development

```bash
cd backend
npm run start:dev          # Start with hot reload
npm run lint               # Run ESLint
npm run test               # Run tests
npx prisma studio          # Open database GUI
npx prisma migrate dev     # Create new migration
```

### Frontend Development

```bash
cd frontend
npm run dev                # Start Next.js dev server
npm run build              # Build for production
npm run lint               # Run ESLint
npm run type-check         # TypeScript check
```

## 🗄️ Database

### Schema Overview

- **Users**: Authentication, roles (student/counselor/admin)
- **StudentProfile**: Student-specific data
- **CounselorProfile**: Counselor-specific data
- **Resume**: Resume files and parsed content
- **ResumeFeedback**: AI and counselor feedback
- **Job**: Job postings
- **Application**: Job application tracking
- **Interview**: Interview scheduling
- **Skill**: Skills database
- **CounselingSession**: Counselor sessions

### Sample Data

The seed script creates:
- Admin user: `admin@careerbuddy.com` / `admin123`
- Counselor: `counselor@careerbuddy.com` / `counselor123`
- Student: `student@careerbuddy.com` / `student123`
- Sample jobs and skills

## 🔐 Authentication & Authorization

### JWT Authentication
- Tokens expire in 7 days (configurable)
- Role-based access control (RBAC)
- Protected routes with guards

### User Roles
- **STUDENT**: Upload resumes, apply for jobs, book sessions
- **COUNSELOR**: Review resumes, provide feedback, manage sessions
- **ADMIN**: Platform management, analytics, user management

### API Protection
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Get('admin-only')
adminOnlyEndpoint() { ... }
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Users
- `GET /api/users/me` - Get own profile
- `PUT /api/users/me` - Update own profile
- `GET /api/users` - List all users (admin only)

### Resumes (Stubs)
- `GET /api/resumes` - List user resumes
- `POST /api/resumes/upload` - Upload resume
- `POST /api/resumes/:id/analyze` - Analyze resume

### Jobs (Stubs)
- `GET /api/jobs` - List jobs
- `GET /api/jobs/search` - Search jobs
- `GET /api/jobs/recommendations` - AI recommendations

### Applications (Stubs)
- `GET /api/applications` - List applications
- `POST /api/applications` - Apply for job
- `PUT /api/applications/:id/status` - Update status

### Admin (Stubs)
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/analytics/users` - User analytics

## 🎨 Frontend Architecture

### Tech Stack
- **Next.js 14**: App Router, TypeScript
- **TailwindCSS**: Styling
- **shadcn/ui**: Component library
- **React Query**: Server state management
- **Zustand**: Client state (via Auth Context)
- **React Hook Form + Zod**: Form handling

### Key Components
- `AuthProvider`: Authentication context
- `QueryProvider`: React Query setup
- UI Components: Button, Card, Input, etc.

### Routing
- `/` - Landing page
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/dashboard` - Role-based dashboard

## 🐳 Docker Development

### Services
- **postgres**: PostgreSQL 13 database
- **backend**: NestJS API (port 3001)
- **frontend**: Next.js app (port 3000)

### Commands
```bash
docker-compose up -d          # Start all services
docker-compose logs backend   # View backend logs
docker-compose exec postgres psql -U careerbuddy careerbuddy_db
docker-compose down           # Stop all services
```

## 🔮 Future Development

### Phase 1: Core Features
- [ ] File upload handling (Multer)
- [ ] Resume parsing (Python AI service)
- [ ] AI feedback generation
- [ ] Job recommendation engine
- [ ] Application status tracking

### Phase 2: Advanced Features
- [ ] Real-time counselor chat
- [ ] Interview scheduling
- [ ] Video call integration
- [ ] Advanced analytics
- [ ] Mobile app (React Native)

### Phase 3: AI Integration
- [ ] Python microservices
- [ ] Resume optimization AI
- [ ] Interview preparation AI
- [ ] Career path recommendations
- [ ] Skills gap analysis

## 🧪 Testing

### Backend Testing
```bash
npm run test              # Unit tests
npm run test:e2e         # End-to-end tests
npm run test:cov         # Coverage report
```

### Frontend Testing (TODO)
- Jest + React Testing Library
- Cypress for E2E testing
- Storybook for component testing

## 📝 Code Standards

### TypeScript
- Strict mode enabled
- Proper type definitions
- No `any` types in production code

### Code Style
- Prettier for formatting
- ESLint for linting
- Consistent naming conventions

### Git Workflow
- Feature branches
- Descriptive commit messages
- Pull request reviews

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   docker-compose up -d postgres
   # Wait for PostgreSQL to start
   ```

2. **Prisma Client Out of Sync**
   ```bash
   npx prisma generate
   ```

3. **Port Already in Use**
   ```bash
   # Change ports in docker-compose.yml or .env
   ```

4. **Node Modules Issues**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

Happy coding! 🚀
