# CareerBuddy Complete User Flow Documentation

## 🎯 **System Overview**

CareerBuddy is an AI-powered career guidance platform designed to help students navigate their career journey through personalized recommendations, resume optimization, and professional counseling.

### **Architecture**
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: NestJS + MongoDB + Mongoose
- **AI Integration**: Custom AI services for resume analysis and job matching
- **Authentication**: JWT-based with role-based access control

## 📋 **Quick Reference**

### **Frontend Pages Overview**
| Role | Page | Purpose |
|------|------|---------|
| **Student** | `/dashboard` | Main dashboard with overview |
| | `/dashboard/profile` | Profile management |
| | `/dashboard/resumes` | Resume creation & management |
| | `/dashboard/jobs` | Job discovery & search |
| | `/dashboard/applications` | Application tracking |
| **Admin** | `/admin` | System overview & analytics |
| | `/admin/users` | User management |
| | `/admin/jobs` | Job management with full details |
| | `/admin/analytics` | Platform analytics |
| | `/admin/settings` | System configuration |
| **Counselor** | `/counselor` | Student overview dashboard |
| | `/counselor/students` | Assigned students |
| | `/counselor/sessions` | Session management |
| | `/counselor/feedback` | Student feedback |
| **Shared** | `/auth/login` | Authentication |
| | `/auth/register` | Registration |
| | `/contact` | Support contact |

### **Key API Endpoints**
| Method | Endpoint | Purpose | Access |
|--------|----------|---------|---------|
| `POST` | `/auth/register` | User registration | Public |
| `POST` | `/auth/login` | Authentication | Public |
| `GET` | `/users/me` | Get profile | Authenticated |
| `GET` | `/jobs` | Browse jobs | Student/Counselor |
| `POST` | `/applications` | Submit application | Student |
| `GET` | `/admin/stats` | Dashboard stats | Admin |
| `GET` | `/counselor/students` | Assigned students | Counselor |

## 👥 **User Roles & Responsibilities**

### 🎓 **STUDENT** (Primary User)
**Purpose**: Get career guidance, build resumes, find jobs, and receive personalized recommendations

**Core Features**:
- **Profile Management**: Create and maintain detailed academic/professional profiles
- **Resume Builder**: AI-powered resume creation and optimization
- **Job Discovery**: Browse and apply to relevant job opportunities
- **AI Recommendations**: Get personalized career and job suggestions
- **Application Tracking**: Monitor job application status and progress
- **Counselor Communication**: Chat with assigned career counselors
- **Skill Assessment**: Take assessments to identify strengths and gaps
- **Learning Resources**: Access curated educational content

**Frontend Pages**:
- `/auth/register` - Registration with role selection
- `/auth/register/student` - Student-specific registration
- `/auth/register/personal` - Personal information setup
- `/dashboard` - Main student dashboard
- `/dashboard/profile` - Profile management
- `/dashboard/resumes` - Resume management
- `/dashboard/resumes/analysis/[id]` - AI resume analysis
- `/dashboard/jobs` - Job discovery and search
- `/dashboard/applications` - Application tracking
- `/contact` - Contact support

**Backend Services**:
- `AuthService` - Registration, login, JWT management
- `UsersService` - Profile management, user CRUD
- `ResumesService` - Resume creation, analysis, feedback
- `JobsService` - Job listings, search, recommendations
- `ApplicationsService` - Application tracking, status updates
- `AiIntegrationService` - Resume analysis, job matching

**API Endpoints**:
```
POST /auth/register - User registration
POST /auth/login - User authentication
GET /users/me - Get current user profile
PUT /users/me - Update profile
GET /resumes - Get user resumes
POST /resumes - Create new resume
GET /resumes/:id/analysis - Get AI analysis
GET /jobs - Browse jobs with filters
POST /applications - Submit job application
GET /applications - Track applications
```

**User Journey**:
1. **Registration** → `/auth/register/student` → Email verification → Profile setup
2. **Profile Building** → `/dashboard/profile` → Skills assessment → Resume creation
3. **Job Exploration** → `/dashboard/jobs` → AI matching → Application submission
4. **Counselor Assignment** → Chat integration → Regular check-ins → Career planning
5. **Progress Tracking** → `/dashboard` → Skill development → Career advancement

---

### 👨‍💼 **ADMIN** (System Manager)
**Purpose**: Oversee platform operations, manage users, and configure system settings

**Core Features**:
- **User Management**: View, edit, and manage all user accounts
- **Job Management**: Create, edit, and monitor job postings with detailed descriptions
- **System Settings**: Configure platform features, security, and limits
- **Analytics Dashboard**: Monitor platform usage and performance metrics
- **Content Moderation**: Review and approve user-generated content
- **Counselor Assignment**: Assign students to appropriate counselors
- **Feature Toggles**: Enable/disable platform features as needed
- **Email Configuration**: Manage system notifications and communications

**Admin Capabilities**:
- **Complete Job Visibility**: View all jobs with full descriptions, requirements, benefits, and application data
- **User Analytics**: Track student progress, counselor performance, and system usage
- **System Health**: Monitor AI services, database performance, and security metrics
- **Configuration Control**: Manage registration settings, feature availability, and user limits

**Frontend Pages**:
- `/admin` - Main admin dashboard with analytics
- `/admin/users` - Complete user management system
- `/admin/jobs` - Job management with detailed descriptions
- `/admin/analytics` - Platform analytics and reporting
- `/admin/settings` - System configuration and settings

**Backend Services**:
- `AdminService` - Dashboard stats, user management, system operations
- `UsersService` - User CRUD operations with admin privileges
- `JobsService` - Job management, creation, editing, activation
- `ApplicationsService` - Application monitoring and management
- `CounselorService` - Counselor assignment and management

**API Endpoints**:
```
GET /admin/stats - Dashboard statistics
GET /admin/users - All users with filters
PUT /admin/users/:id - Update any user
PUT /admin/users/:id/activate - Activate user
PUT /admin/users/:id/deactivate - Deactivate user
GET /admin/jobs - All jobs with full details
POST /admin/jobs - Create new job posting
PUT /admin/jobs/:id - Update job details
DELETE /admin/jobs/:id - Remove job posting
GET /admin/analytics - Platform analytics
PUT /admin/settings - Update system settings
```

**Admin Workflow**:
1. **Daily Monitoring** → `/admin` → Check system health → Review user activity
2. **Job Management** → `/admin/jobs` → Post new opportunities → Update existing listings
3. **User Support** → `/admin/users` → Handle escalations → Manage account issues
4. **System Configuration** → `/admin/settings` → Update settings → Deploy new features
5. **Analytics Review** → `/admin/analytics` → Generate reports → Make data-driven decisions

---

### 🧑‍🏫 **COUNSELOR** (Career Advisor)
**Purpose**: Provide personalized career guidance and support to assigned students

**Core Features**:
- **Student Portfolio**: View assigned students' profiles, resumes, and progress
- **Communication Hub**: Real-time chat and messaging with students
- **Progress Tracking**: Monitor student development and milestone achievements
- **Resource Sharing**: Provide curated learning materials and opportunities
- **Assessment Tools**: Conduct career assessments and skill evaluations
- **Appointment Scheduling**: Manage one-on-one counseling sessions
- **Recommendation Engine**: Suggest career paths and development strategies
- **Report Generation**: Create progress reports and career plans

**Frontend Pages**:
- `/counselor` - Counselor dashboard with student overview
- `/counselor/students` - Assigned students management
- `/counselor/sessions` - Counseling session scheduling
- `/counselor/feedback` - Student feedback and reports
- `/counselor/analytics` - Counselor performance analytics

**Backend Services**:
- `CounselorService` - Student assignment, session management, analytics
- `UsersService` - Student profile access and updates
- `ResumesService` - Resume review and feedback provision
- `ApplicationsService` - Student application monitoring
- `CounselingSessionService` - Session scheduling and tracking

**API Endpoints**:
```
GET /counselor/students - Get assigned students
GET /counselor/students/:id - Get student details
PUT /counselor/students/:id/feedback - Provide student feedback
GET /counselor/sessions - Get counseling sessions
POST /counselor/sessions - Schedule new session
PUT /counselor/sessions/:id - Update session
GET /counselor/analytics/overview - Counselor dashboard stats
GET /counselor/analytics/students - Student progress analytics
POST /counselor/feedback - Submit student feedback
```

**Counselor Workflow**:
1. **Student Assignment** → `/counselor/students` → Review profiles → Initial assessment
2. **Goal Setting** → `/counselor/sessions` → Career planning → Milestone definition
3. **Regular Check-ins** → `/counselor` → Progress review → Guidance provision
4. **Resource Curation** → `/counselor/feedback` → Skill gap analysis → Learning recommendations
5. **Success Tracking** → `/counselor/analytics` → Achievement monitoring → Outcome reporting

---

## 🔄 **Inter-Role Interactions**

### **Student ↔ Admin**
- **Account Issues**: Students contact admin for technical problems
- **Feature Requests**: Students suggest improvements via admin channels
- **Policy Compliance**: Admin ensures students follow platform guidelines

### **Student ↔ Counselor**
- **Primary Relationship**: Regular mentoring and career guidance
- **Communication**: Real-time chat, scheduled sessions, progress updates
- **Collaboration**: Joint career planning and skill development

### **Admin ↔ Counselor**
- **Assignment Management**: Admin assigns students to counselors
- **Performance Monitoring**: Admin tracks counselor effectiveness
- **Resource Allocation**: Admin provides tools and access to counselors

---

## 🎯 **Why Each Role is Necessary**

### **Students** - The Core Users
- **Drive Platform Purpose**: Primary beneficiaries of career guidance
- **Generate Data**: Provide usage patterns for AI improvement
- **Create Community**: Build network effects and peer learning

### **Admins** - The System Guardians
- **Ensure Quality**: Maintain high standards for jobs and content
- **Scale Operations**: Manage growth and system performance
- **Strategic Oversight**: Make platform-wide decisions and improvements

### **Counselors** - The Human Touch
- **Personalization**: Provide human insight AI cannot replicate
- **Emotional Support**: Offer encouragement and motivation
- **Expert Guidance**: Share industry knowledge and career wisdom

---

## 🚀 **Key Platform Features by Role**

### **For Students**:
- ✅ AI-powered resume optimization
- ✅ Intelligent job matching
- ✅ Skill gap analysis
- ✅ Career path recommendations
- ✅ Application tracking
- ✅ Counselor communication
- ✅ Learning resource curation

### **For Admins**:
- ✅ Comprehensive job management with detailed descriptions
- ✅ User analytics and reporting
- ✅ System configuration and settings
- ✅ Feature toggle controls
- ✅ Security and compliance monitoring
- ✅ Performance optimization tools

### **For Counselors**:
- ✅ Student portfolio management
- ✅ Progress tracking tools
- ✅ Communication platform
- ✅ Resource sharing capabilities
- ✅ Assessment and evaluation tools
- ✅ Appointment scheduling system

---

## 📊 **Success Metrics**

### **Student Success**:
- Job placement rate
- Resume improvement scores
- Skill development progress
- User engagement levels

### **Admin Efficiency**:
- System uptime and performance
- User satisfaction scores
- Feature adoption rates
- Platform growth metrics

### **Counselor Effectiveness**:
- Student progress rates
- Counseling session quality
- Resource utilization
- Student feedback scores

---

## 🔧 **Technical Implementation**

### **Frontend** (Next.js + TypeScript)
- Role-based routing and access control
- Real-time communication features
- Responsive design for all devices
- AI integration for recommendations

### **Backend** (NestJS + MongoDB)
- RESTful API with role-based permissions
- AI service integration
- Real-time messaging capabilities
- Comprehensive logging and monitoring

### **AI Integration**
- Resume analysis and optimization
- Job matching algorithms
- Career path recommendations
- Skill assessment tools

---

## 🔄 **Detailed User Workflows**

### **🎓 Student Complete Journey**

#### **Phase 1: Onboarding (Days 1-3)**
1. **Registration** → `/auth/register`
   - Select "Student" role
   - Basic information entry
   - Email verification
   
2. **Profile Setup** → `/auth/register/student` → `/auth/register/personal`
   - Academic background
   - Skills and interests
   - Career goals
   - Contact information
   
3. **Initial Assessment** → `/dashboard/profile`
   - Complete skill assessment
   - Upload existing resume (optional)
   - Set career preferences

#### **Phase 2: Resume Building (Days 4-7)**
1. **Resume Creation** → `/dashboard/resumes`
   - Use AI-powered resume builder
   - Input work experience, education, skills
   - Choose from professional templates
   
2. **AI Analysis** → `/dashboard/resumes/analysis/[id]`
   - Get AI feedback on resume
   - Receive improvement suggestions
   - Implement recommendations
   
3. **Optimization** → Resume iterations based on AI feedback

#### **Phase 3: Job Discovery (Week 2+)**
1. **Job Exploration** → `/dashboard/jobs`
   - Browse AI-recommended jobs
   - Use advanced filters (location, salary, experience)
   - Save interesting opportunities
   
2. **Application Process** → Job application workflow
   - One-click apply with optimized resume
   - Track application status
   - Receive application feedback

#### **Phase 4: Counselor Engagement (Ongoing)**
1. **Counselor Assignment** → Automatic assignment based on field/goals
2. **Regular Check-ins** → Scheduled sessions and chat communication
3. **Progress Reviews** → Monthly progress assessments
4. **Career Planning** → Long-term career roadmap development

---

### **👨‍💼 Admin Complete Workflow**

#### **Daily Operations**
1. **Morning Dashboard Review** → `/admin`
   - Check overnight registrations
   - Review system health metrics
   - Monitor application volumes
   
2. **User Management** → `/admin/users`
   - Approve pending registrations
   - Handle user support tickets
   - Manage account issues
   
3. **Job Management** → `/admin/jobs`
   - Review new job postings
   - Update job descriptions
   - Monitor application rates

#### **Weekly Tasks**
1. **Analytics Review** → `/admin/analytics`
   - Generate weekly reports
   - Analyze user engagement
   - Track platform growth
   
2. **System Configuration** → `/admin/settings`
   - Update platform settings
   - Configure new features
   - Manage security policies

#### **Monthly Activities**
1. **Performance Analysis** → Comprehensive platform review
2. **Feature Planning** → Based on user feedback and analytics
3. **Counselor Performance** → Review counselor effectiveness

---

### **🧑‍🏫 Counselor Complete Workflow**

#### **Student Onboarding**
1. **New Assignment** → `/counselor/students`
   - Review student profile
   - Analyze career goals
   - Plan initial consultation
   
2. **Initial Assessment** → First meeting setup
   - Conduct skills assessment
   - Understand career aspirations
   - Create development plan

#### **Ongoing Support**
1. **Regular Check-ins** → `/counselor/sessions`
   - Weekly/bi-weekly meetings
   - Progress monitoring
   - Goal adjustment
   
2. **Resume Reviews** → Provide feedback on student resumes
3. **Application Support** → Guide job application process
4. **Career Planning** → Long-term career roadmap

#### **Performance Tracking**
1. **Student Progress** → `/counselor/analytics`
   - Track student achievements
   - Monitor engagement levels
   - Measure success metrics
   
2. **Feedback Provision** → `/counselor/feedback`
   - Submit progress reports
   - Provide recommendations
   - Document sessions

---

## 🛠 **Technical Implementation Details**

### **Frontend Architecture**
```
src/
├── app/                    # Next.js 14 App Router
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Student dashboard
│   ├── admin/            # Admin management
│   ├── counselor/        # Counselor interface
│   └── api/              # API routes
├── components/
│   ├── ui/               # Reusable UI components
│   └── dashboard/        # Dashboard-specific components
├── lib/
│   ├── api-client.ts     # API communication
│   ├── auth-context.tsx  # Authentication context
│   └── utils.ts          # Utility functions
└── hooks/                # Custom React hooks
```

### **Backend Architecture**
```
src/
├── auth/                 # Authentication & authorization
├── users/               # User management
├── admin/               # Admin operations
├── counselor/           # Counselor services
├── jobs/                # Job management
├── applications/        # Application tracking
├── resumes/             # Resume services
├── ai-integration/      # AI services
└── common/              # Shared schemas & utilities
```

### **Database Schema**
```javascript
// User Schema
{
  _id: ObjectId,
  email: String,
  role: Enum['STUDENT', 'COUNSELOR', 'ADMIN'],
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    education: Object,
    skills: [String],
    experience: [Object]
  },
  isActive: Boolean,
  createdAt: Date
}

// Job Schema
{
  _id: ObjectId,
  title: String,
  company: String,
  description: String,
  requirements: [String],
  location: String,
  salary: { min: Number, max: Number },
  skills: [String],
  isActive: Boolean,
  createdBy: ObjectId
}

// Application Schema
{
  _id: ObjectId,
  userId: ObjectId,
  jobId: ObjectId,
  resumeId: ObjectId,
  status: Enum['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED'],
  appliedAt: Date,
  feedback: String
}
```

### **AI Integration Services**
```typescript
// Resume Analysis Service
class ResumeAnalysisService {
  analyzeResume(resumeContent: string): Promise<AnalysisResult>
  generateSuggestions(analysis: AnalysisResult): Promise<Suggestion[])
  scoreResume(resumeContent: string): Promise<number>
}

// Job Matching Service
class JobMatchingService {
  findMatchingJobs(userProfile: UserProfile): Promise<Job[]>
  calculateMatchScore(job: Job, profile: UserProfile): number
  generateRecommendations(userId: string): Promise<Recommendation[]>
}
```

### **Authentication & Authorization**
```typescript
// JWT Strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  async validate(payload: JwtPayload): Promise<User> {
    return this.usersService.findById(payload.sub);
  }
}

// Role-based Guards
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>('roles', context.getHandler());
    const user = context.switchToHttp().getRequest().user;
    return requiredRoles.includes(user.role);
  }
}
```

### **Real-time Features**
- **WebSocket Integration**: Real-time chat between students and counselors
- **Live Notifications**: Application status updates, new job alerts
- **Progress Tracking**: Real-time updates on resume analysis and job matching

---

## 📊 **Advanced Analytics & Reporting**

### **Student Analytics**
- Resume improvement scores over time
- Job application success rates
- Skill development progress
- Career goal achievement tracking

### **Admin Analytics**
- Platform usage statistics
- User engagement metrics
- Job posting performance
- Counselor effectiveness ratings

### **Counselor Analytics**
- Student progress tracking
- Session effectiveness metrics
- Success rate measurements
- Resource utilization statistics

---

This comprehensive system ensures that each user type has the tools and features they need to succeed in their respective roles while maintaining a cohesive, integrated platform experience with robust technical implementation and detailed workflow management.
