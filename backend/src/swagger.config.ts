import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('CareerBuddy API')
    .setDescription(`
      # CareerBuddy - AI-Powered Resume & Career Assistant Platform

      A comprehensive platform that helps students build, optimize, and manage their resumes while providing personalized career guidance and job recommendations powered by advanced AI technologies.

      ## Features

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

      ## Authentication

      This API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

      \`\`\`
      Authorization: Bearer <your-jwt-token>
      \`\`\`

      ## Error Handling

      The API returns standard HTTP status codes:

      - **200**: Success
      - **201**: Created
      - **400**: Bad Request
      - **401**: Unauthorized
      - **403**: Forbidden
      - **404**: Not Found
      - **500**: Internal Server Error

      Error responses follow this format:

      \`\`\`json
      {
        "statusCode": 400,
        "message": "Error description",
        "error": "Bad Request"
      }
      \`\`\`

      ## Rate Limiting

      API endpoints are rate limited to ensure fair usage:

      - **Authentication endpoints**: 5 requests per minute
      - **General endpoints**: 100 requests per minute
      - **File uploads**: 10 requests per minute

      ## Pagination

      List endpoints support pagination with query parameters:

      - \`page\`: Page number (default: 1)
      - \`limit\`: Items per page (default: 20, max: 100)

      Response format:
      \`\`\`json
      {
        "data": [...],
        "pagination": {
          "page": 1,
          "limit": 20,
          "total": 100,
          "totalPages": 5
        }
      }
      \`\`\`
    `)
    .setVersion('1.0.0')
    .setContact(
      'CareerBuddy Team',
      'https://careerbuddy.ai',
      'support@careerbuddy.ai'
    )
    .setLicense(
      'MIT',
      'https://opensource.org/licenses/MIT'
    )
    .addServer('http://localhost:3001', 'Development Server')
    .addServer('https://api.careerbuddy.ai', 'Production Server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .addTag('auth', 'Authentication endpoints for login, registration, and token management')
    .addTag('users', 'User profile management and user-related operations')
    .addTag('resumes', 'Resume upload, analysis, and management with AI-powered feedback')
    .addTag('jobs', 'Job postings, search, and AI-powered recommendations')
    .addTag('applications', 'Job application tracking and management')
    .addTag('counselor', 'Career counselor features for student guidance and analytics')
    .addTag('admin', 'Administrative functions, analytics, and platform management')
    .addTag('ai-services', 'AI service integrations and health checks')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    deepScanRoutes: true,
  });

  // Add custom CSS for better documentation appearance
  const customCss = `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 50px 0 }
    .swagger-ui .info .title { color: #3b82f6 }
    .swagger-ui .scheme-container { background: #f8fafc; padding: 20px; border-radius: 8px }
    .swagger-ui .auth-wrapper { border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px }
    .swagger-ui .btn.authorize { background-color: #3b82f6; border-color: #3b82f6 }
    .swagger-ui .btn.authorize:hover { background-color: #2563eb; border-color: #2563eb }
  `;

  SwaggerModule.setup('api/docs', app, document, {
    customCss,
    customSiteTitle: 'CareerBuddy API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true,
    },
  });

  console.log(`📚 API Documentation available at: http://localhost:3001/api/docs`);
}

// Export Swagger document for external use (e.g., generating client SDKs)
export function getSwaggerDocument(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('CareerBuddy API')
    .setDescription('AI-Powered Resume & Career Assistant Platform API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  return SwaggerModule.createDocument(app, config);
}
