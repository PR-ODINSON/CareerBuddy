#!/bin/bash

# CareerBuddy Backend Startup Script with AI Services
# This script ensures AI services are running before starting the backend

set -e

echo "🚀 Starting CareerBuddy Backend with AI Services..."

# Check if we're in Docker environment
if [ -f "/.dockerenv" ]; then
    echo "📦 Running in Docker environment"
    IS_DOCKER=true
else
    echo "💻 Running in local environment"
    IS_DOCKER=false
fi

# Function to check if AI services are running
check_ai_services() {
    echo "🔍 Checking AI services..."
    
    RESUME_ANALYZER_URL=${AI_RESUME_ANALYZER_URL:-"http://localhost:8001"}
    JOB_MATCHER_URL=${AI_JOB_MATCHER_URL:-"http://localhost:8002"}
    
    RESUME_ANALYZER_HEALTHY=false
    JOB_MATCHER_HEALTHY=false
    
    # Check Resume Analyzer
    if curl -f "$RESUME_ANALYZER_URL/health" > /dev/null 2>&1; then
        echo "✅ Resume Analyzer is healthy at $RESUME_ANALYZER_URL"
        RESUME_ANALYZER_HEALTHY=true
    else
        echo "❌ Resume Analyzer is not responding at $RESUME_ANALYZER_URL"
    fi
    
    # Check Job Matcher
    if curl -f "$JOB_MATCHER_URL/health" > /dev/null 2>&1; then
        echo "✅ Job Matcher is healthy at $JOB_MATCHER_URL"
        JOB_MATCHER_HEALTHY=true
    else
        echo "❌ Job Matcher is not responding at $JOB_MATCHER_URL"
    fi
    
    if [ "$RESUME_ANALYZER_HEALTHY" = true ] && [ "$JOB_MATCHER_HEALTHY" = true ]; then
        return 0
    else
        return 1
    fi
}

# Function to start AI services locally
start_ai_services_local() {
    echo "🤖 Starting AI services locally..."
    
    # Check if docker-compose exists
    if [ -f "../ai-services/docker-compose.yml" ]; then
        cd ../ai-services
        echo "📦 Starting AI services with docker-compose..."
        docker-compose up -d
        cd ../backend
    elif [ -f "../docker-compose.yml" ]; then
        cd ..
        echo "📦 Starting all services with docker-compose..."
        docker-compose up -d resume-analyzer job-matcher
        cd backend
    else
        echo "❌ No docker-compose file found. Please set up AI services manually."
        exit 1
    fi
}

# Function to wait for AI services
wait_for_ai_services() {
    echo "⏳ Waiting for AI services to be ready..."
    
    MAX_ATTEMPTS=30
    ATTEMPT=1
    
    while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
        echo "🔄 Attempt $ATTEMPT/$MAX_ATTEMPTS"
        
        if check_ai_services; then
            echo "🎉 All AI services are ready!"
            return 0
        fi
        
        echo "⏰ Waiting 10 seconds before next attempt..."
        sleep 10
        ATTEMPT=$((ATTEMPT + 1))
    done
    
    echo "⚠️ AI services are not ready after $MAX_ATTEMPTS attempts."
    echo "🔧 Backend will start anyway, but AI features may not work."
    echo ""
    echo "To troubleshoot:"
    echo "1. Check if Docker is running"
    echo "2. Run 'docker-compose up -d' in the ai-services directory"
    echo "3. Check logs with 'docker-compose logs resume-analyzer job-matcher'"
    echo ""
    return 1
}

# Main execution
main() {
    # If not in Docker and AI services are not running, try to start them
    if [ "$IS_DOCKER" = false ]; then
        if ! check_ai_services; then
            echo "🚀 AI services not detected. Attempting to start them..."
            start_ai_services_local
            wait_for_ai_services
        else
            echo "✅ AI services are already running!"
        fi
    fi
    
    # Start the backend
    echo "🏃 Starting CareerBuddy Backend..."
    
    # Check if we should run in development or production mode
    if [ "${NODE_ENV}" = "production" ]; then
        echo "🏭 Starting in production mode..."
        npm run start:prod
    else
        echo "🛠️ Starting in development mode..."
        npm run start:dev
    fi
}

# Run main function
main "$@"
