#!/bin/bash

echo "🚀 Setting up CareerBuddy Development Environment..."

# Create environment files from examples
echo "📝 Creating environment files..."
cp env.example backend/.env
cp env.example frontend/.env.local

# Backend setup
echo "🔧 Setting up backend..."
cd backend
npm install
npx prisma generate
echo "Backend dependencies installed!"

# Frontend setup
echo "🎨 Setting up frontend..."
cd ../frontend
npm install
echo "Frontend dependencies installed!"

cd ..

# Create uploads directory
mkdir -p backend/uploads

echo "✅ Setup complete!"
echo ""
echo "🐳 To start the development environment:"
echo "   docker-compose up -d"
echo ""
echo "🔧 To run services individually:"
echo "   Backend:  cd backend && npm run start:dev"
echo "   Frontend: cd frontend && npm run dev"
echo ""
echo "📊 Database setup:"
echo "   1. Start PostgreSQL: docker-compose up -d postgres"
echo "   2. Run migrations: cd backend && npx prisma migrate dev"
echo "   3. Seed database: cd backend && npx prisma db seed"
echo ""
echo "🌐 Access points:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3001/api"
echo "   Database: postgresql://careerbuddy:password@localhost:5432/careerbuddy_db"
