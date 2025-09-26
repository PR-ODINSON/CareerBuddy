#!/bin/bash

# =================================================================
# CareerBuddy - Complete Setup Script
# AI-Powered Resume & Career Assistant Platform
# =================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print colored output
print_color() {
    printf "${1}${2}${NC}\n"
}

print_header() {
    echo
    print_color $CYAN "=============================================="
    print_color $CYAN "$1"
    print_color $CYAN "=============================================="
    echo
}

print_step() {
    print_color $BLUE "🔧 $1"
}

print_success() {
    print_color $GREEN "✅ $1"
}

print_warning() {
    print_color $YELLOW "⚠️  $1"
}

print_error() {
    print_color $RED "❌ $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    local missing_deps=()
    
    if ! command_exists node; then
        missing_deps+=("Node.js (v18+)")
    else
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -lt 18 ]; then
            missing_deps+=("Node.js v18+ (current: $(node -v))")
        else
            print_success "Node.js $(node -v) found"
        fi
    fi
    
    if ! command_exists npm; then
        missing_deps+=("npm")
    else
        print_success "npm $(npm -v) found"
    fi
    
    if ! command_exists python3; then
        missing_deps+=("Python 3.8+")
    else
        PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
        print_success "Python $PYTHON_VERSION found"
    fi
    
    if ! command_exists pip3; then
        missing_deps+=("pip3")
    else
        print_success "pip3 found"
    fi
    
    if ! command_exists docker; then
        missing_deps+=("Docker")
    else
        print_success "Docker found"
    fi
    
    if ! command_exists docker-compose; then
        missing_deps+=("Docker Compose")
    else
        print_success "Docker Compose found"
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing required dependencies:"
        for dep in "${missing_deps[@]}"; do
            echo "  - $dep"
        done
        echo
        print_warning "Please install the missing dependencies and run this script again."
        exit 1
    fi
    
    print_success "All prerequisites satisfied!"
}

# Setup environment files
setup_environment() {
    print_header "Setting Up Environment"
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_step "Creating .env file from template..."
        cp env.example .env
        print_success ".env file created"
        print_warning "Please review and update the .env file with your specific configuration"
    else
        print_warning ".env file already exists, skipping creation"
    fi
    
    # Create frontend .env.local if it doesn't exist
    if [ ! -f frontend/.env.local ]; then
        print_step "Creating frontend environment file..."
        cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=CareerBuddy
NEXT_PUBLIC_APP_VERSION=1.0.0
EOF
        print_success "Frontend .env.local created"
    else
        print_warning "Frontend .env.local already exists, skipping creation"
    fi
}

# Setup backend
setup_backend() {
    print_header "Setting Up Backend (NestJS)"
    
    cd backend
    
    print_step "Installing backend dependencies..."
    npm install
    print_success "Backend dependencies installed"
    
    print_step "Generating Prisma client..."
    npx prisma generate
    print_success "Prisma client generated"
    
    print_step "Building backend..."
    npm run build
    print_success "Backend built successfully"
    
    cd ..
}

# Setup frontend
setup_frontend() {
    print_header "Setting Up Frontend (Next.js)"
    
    cd frontend
    
    print_step "Installing frontend dependencies..."
    npm install
    print_success "Frontend dependencies installed"
    
    print_step "Building frontend..."
    npm run build
    print_success "Frontend built successfully"
    
    cd ..
}

# Setup AI services
setup_ai_services() {
    print_header "Setting Up AI Services (Python FastAPI)"
    
    # Setup Resume Analyzer
    print_step "Setting up Resume Analyzer service..."
    cd ai-services/resume-analyzer
    
    if [ ! -d "venv" ]; then
        print_step "Creating virtual environment for Resume Analyzer..."
        python3 -m venv venv
    fi
    
    print_step "Activating virtual environment and installing dependencies..."
    source venv/bin/activate
    pip install -r requirements.txt
    python -m spacy download en_core_web_sm
    deactivate
    print_success "Resume Analyzer setup complete"
    
    cd ../..
    
    # Setup Job Matcher
    print_step "Setting up Job Matcher service..."
    cd ai-services/job-matcher
    
    if [ ! -d "venv" ]; then
        print_step "Creating virtual environment for Job Matcher..."
        python3 -m venv venv
    fi
    
    print_step "Activating virtual environment and installing dependencies..."
    source venv/bin/activate
    pip install -r requirements.txt
    deactivate
    print_success "Job Matcher setup complete"
    
    cd ../..
}

# Setup database
setup_database() {
    print_header "Setting Up Database"
    
    print_step "Starting MongoDB with Docker..."
    
    # Create docker-compose.yml for MongoDB if it doesn't exist
    if [ ! -f docker-compose.db.yml ]; then
        cat > docker-compose.db.yml << EOF
version: '3.8'
services:
  mongodb:
    image: mongo:7.0
    container_name: careerbuddy_mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin123
      MONGO_INITDB_DATABASE: careerbuddy_db
    volumes:
      - mongodb_data:/data/db
      - ./scripts/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    networks:
      - careerbuddy_network

  redis:
    image: redis:7-alpine
    container_name: careerbuddy_redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - careerbuddy_network

volumes:
  mongodb_data:
  redis_data:

networks:
  careerbuddy_network:
    driver: bridge
EOF
    fi
    
    # Create MongoDB initialization script
    mkdir -p scripts
    cat > scripts/mongo-init.js << EOF
// MongoDB initialization script for CareerBuddy
db = db.getSiblingDB('careerbuddy_db');

// Create collections with validation
db.createCollection('users');
db.createCollection('resumes');
db.createCollection('jobs');
db.createCollection('applications');
db.createCollection('counselor_assignments');
db.createCollection('counseling_sessions');
db.createCollection('resume_feedback');
db.createCollection('user_analytics');

print('CareerBuddy database initialized successfully!');
EOF
    
    docker-compose -f docker-compose.db.yml up -d
    
    # Wait for MongoDB to be ready
    print_step "Waiting for MongoDB to be ready..."
    sleep 10
    
    print_success "Database setup complete"
}

# Setup database schema
setup_database_schema() {
    print_header "Setting Up Database Schema"
    
    cd backend
    
    print_step "Pushing database schema..."
    npx prisma db push
    print_success "Database schema created"
    
    print_step "Seeding database with sample data..."
    npx prisma db seed 2>/dev/null || print_warning "No seed script found, skipping database seeding"
    
    cd ..
}

# Create necessary directories
create_directories() {
    print_header "Creating Necessary Directories"
    
    directories=(
        "uploads/resumes"
        "uploads/temp"
        "logs"
        "backups"
        "docs"
    )
    
    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            print_step "Created directory: $dir"
        fi
    done
    
    print_success "Directory structure created"
}

# Setup development scripts
setup_dev_scripts() {
    print_header "Setting Up Development Scripts"
    
    # Create start script
    cat > start-dev.sh << EOF
#!/bin/bash

# Start all CareerBuddy services in development mode

echo "🚀 Starting CareerBuddy Development Environment..."

# Start database
echo "📦 Starting database services..."
docker-compose -f docker-compose.db.yml up -d

# Wait for database to be ready
sleep 5

# Start AI services
echo "🤖 Starting AI services..."
cd ai-services/resume-analyzer && source venv/bin/activate && python main.py &
cd ../../ai-services/job-matcher && source venv/bin/activate && python main.py &
cd ../..

# Start backend
echo "⚙️  Starting backend..."
cd backend && npm run start:dev &
cd ..

# Start frontend
echo "🎨 Starting frontend..."
cd frontend && npm run dev &
cd ..

echo "✅ All services started!"
echo "📱 Frontend: http://localhost:3000"
echo "⚙️  Backend API: http://localhost:3001/api"
echo "📚 API Docs: http://localhost:3001/api/docs"
echo "🤖 Resume Analyzer: http://localhost:8001"
echo "🎯 Job Matcher: http://localhost:8002"

wait
EOF
    
    chmod +x start-dev.sh
    
    # Create stop script
    cat > stop-dev.sh << EOF
#!/bin/bash

echo "🛑 Stopping CareerBuddy Development Environment..."

# Kill Node.js and Python processes
pkill -f "npm run dev"
pkill -f "npm run start:dev"
pkill -f "python main.py"

# Stop database services
docker-compose -f docker-compose.db.yml down

echo "✅ All services stopped!"
EOF
    
    chmod +x stop-dev.sh
    
    print_success "Development scripts created"
}

# Generate documentation
generate_docs() {
    print_header "Generating Documentation"
    
    if [ ! -d "docs" ]; then
        mkdir docs
    fi
    
    # Create API documentation
    cat > docs/API.md << EOF
# CareerBuddy API Documentation

## Overview

CareerBuddy is an AI-powered resume and career assistant platform that helps students optimize their resumes, find relevant jobs, and track their application progress.

## Base URL

- Development: \`http://localhost:3001/api\`
- Production: \`https://api.careerbuddy.ai\`

## Authentication

All API endpoints (except authentication) require a Bearer token:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Interactive Documentation

Visit \`http://localhost:3001/api/docs\` for interactive Swagger documentation.

## Endpoints

### Authentication
- \`POST /auth/register\` - Register a new user
- \`POST /auth/login\` - Login user
- \`GET /auth/profile\` - Get current user profile
- \`POST /auth/refresh\` - Refresh JWT token

### Users
- \`GET /users\` - List all users (Admin only)
- \`GET /users/me\` - Get current user profile
- \`PUT /users/me\` - Update current user profile

### Resumes
- \`GET /resumes\` - List user resumes
- \`POST /resumes/upload\` - Upload a new resume
- \`POST /resumes/:id/analyze\` - Analyze resume with AI
- \`PUT /resumes/:id/set-active\` - Set resume as active

### Jobs
- \`GET /jobs\` - List all jobs
- \`GET /jobs/search\` - Search jobs with filters
- \`GET /jobs/recommendations\` - Get AI-powered job recommendations
- \`POST /jobs\` - Create new job posting (Counselor/Admin)

### Applications
- \`GET /applications\` - List user applications
- \`POST /applications\` - Apply for a job
- \`PUT /applications/:id/status\` - Update application status

### Counselor
- \`GET /counselor/students\` - List assigned students
- \`POST /counselor/feedback\` - Provide feedback on student resume
- \`GET /counselor/analytics\` - View counselor analytics

### Admin
- \`GET /admin/dashboard\` - Get dashboard statistics
- \`GET /admin/users\` - Manage all users
- \`POST /admin/assign-student\` - Assign student to counselor
EOF
    
    print_success "Documentation generated"
}

# Main setup function
main() {
    print_header "🎓 CareerBuddy Platform Setup"
    print_color $PURPLE "AI-Powered Resume & Career Assistant"
    echo
    
    # Run setup steps
    check_prerequisites
    setup_environment
    create_directories
    setup_database
    setup_backend
    setup_frontend
    setup_ai_services
    setup_database_schema
    setup_dev_scripts
    generate_docs
    
    print_header "🎉 Setup Complete!"
    
    print_success "CareerBuddy has been successfully set up!"
    echo
    print_color $CYAN "Next Steps:"
    echo "1. Review and update the .env file with your configuration"
    echo "2. Start the development environment: ./start-dev.sh"
    echo "3. Visit http://localhost:3000 to access the application"
    echo "4. Visit http://localhost:3001/api/docs for API documentation"
    echo
    print_color $YELLOW "Useful Commands:"
    echo "• Start development: ./start-dev.sh"
    echo "• Stop development: ./stop-dev.sh"
    echo "• View logs: docker-compose -f docker-compose.db.yml logs"
    echo "• Reset database: cd backend && npx prisma db push --force-reset"
    echo
    print_color $GREEN "Happy coding! 🚀"
}

# Run main function
main "$@"
