@echo off
echo Creating environment files...

echo # Database > backend\.env
echo DATABASE_URL="mongodb://careerbuddy:password@localhost:27017/careerbuddy_db?authSource=admin" >> backend\.env
echo. >> backend\.env
echo # JWT Authentication >> backend\.env
echo JWT_SECRET="your-super-secret-jwt-key-change-in-production-please-use-a-secure-random-string" >> backend\.env
echo JWT_EXPIRES_IN="7d" >> backend\.env
echo. >> backend\.env
echo # Backend API >> backend\.env
echo BACKEND_PORT=3001 >> backend\.env
echo FRONTEND_URL="http://localhost:3000" >> backend\.env

echo # Frontend Environment Variables > frontend\.env.local
echo NEXT_PUBLIC_API_URL="http://localhost:3001/api" >> frontend\.env.local

echo Environment files created successfully!
echo.
echo Now you can start the backend with: cd backend && npm start
