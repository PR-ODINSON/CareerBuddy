# CareerBuddy - AI-Powered Resume & Career Assistant Platform

> **A comprehensive SaaS platform that empowers students with AI-driven career guidance, intelligent resume optimization, and personalized job matching, while enabling counselors to provide effective mentorship and administrators to manage the entire ecosystem.**

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black?logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0-red?logo=nestjs)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?logo=mongodb)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://www.docker.com/)

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Why CareerBuddy?](#-why-careerbuddy)
- [Tech Stack & Architecture](#-tech-stack--architecture)
- [System Architecture](#-system-architecture)
- [User Roles & Workflows](#-user-roles--workflows)
- [Database Schema](#-database-schema)
- [AI Integration](#-ai-integration)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Security Features](#-security-features)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

CareerBuddy is an end-to-end career guidance platform designed specifically for students and young professionals navigating their career journey. Built with modern technologies and powered by advanced AI capabilities, it bridges the gap between academic preparation and professional success.

### The Problem We Solve

- **For Students**: Difficulty in creating ATS-optimized resumes, finding relevant job opportunities, and receiving personalized career guidance
- **For Career Counselors**: Managing multiple students efficiently while providing personalized attention and tracking their progress
- **For Administrators**: Overseeing platform operations, managing users, and ensuring quality of job postings and user experience

### Our Solution

A unified platform that combines:
- **AI-Powered Resume Analysis** with real-time feedback and ATS optimization
- **Intelligent Job Matching** using semantic analysis and machine learning
- **Real-Time Communication** between students and counselors via WebSockets
- **Comprehensive Analytics** for tracking progress and measuring success
- **Role-Based Dashboards** tailored for students, counselors, and administrators

---

## ✨ Key Features

### 🎓 For Students

#### Resume Intelligence
- **AI-Powered Resume Analysis**: Upload resumes in PDF, DOCX, DOC, or TXT format
- **ATS Compatibility Scoring**: Get detailed scores across 5 dimensions (formatting, content quality, keyword optimization, section completeness, readability)
- **Real-Time Feedback**: Receive actionable suggestions for improvement with severity ratings
- **Version Control**: Track resume iterations and improvements over time
- **Skills Extraction**: Automatic identification and categorization of technical and soft skills

#### Job Discovery & Application
- **Intelligent Job Matching**: AI-powered job recommendations based on skills, experience, and preferences
- **Advanced Filtering**: Search by location, experience level, employment type, and more
- **One-Click Applications**: Apply with optimized resumes instantly
- **Application Tracking**: Complete lifecycle management from application to interview to offer
- **Interview Scheduling**: Manage interview schedules with calendar integration

#### Career Guidance
- **Personalized Counselor**: Get assigned to a career counselor based on your field
- **Real-Time Chat**: Communicate with counselors via WebSocket-powered messaging
- **Progress Tracking**: Visual dashboards showing skill development and application success
- **Skills Gap Analysis**: Identify missing skills and receive learning recommendations
- **Career Path Suggestions**: AI-generated career trajectory recommendations

### 👨‍🏫 For Career Counselors

#### Student Management
- **Student Portfolio**: View comprehensive profiles of all assigned students
- **Progress Monitoring**: Track student development across multiple metrics
- **Resume Review**: Provide detailed feedback on student resumes
- **Session Management**: Schedule and manage one-on-one counseling sessions

#### Communication & Feedback
- **Real-Time Messaging**: Instant communication with students via WebSockets
- **Session Scheduling**: Flexible appointment booking system with reminders
- **Feedback System**: Structured feedback mechanism with session notes
- **Progress Reports**: Generate detailed progress reports for each student

#### Analytics & Insights
- **Performance Dashboard**: Track counselor effectiveness metrics
- **Student Analytics**: Monitor student engagement and success rates
- **Session Statistics**: Analyze counseling session effectiveness
- **Export Capabilities**: Download reports in PDF format

### 👨‍💼 For Administrators

#### Platform Management
- **User Administration**: Complete CRUD operations for all user accounts
- **Role Management**: Assign and modify user roles (Student, Counselor, Admin)
- **Account Activation**: Approve/deactivate user accounts with audit trails
- **Bulk Operations**: Manage multiple users efficiently

#### Job Management
- **Job Posting System**: Create and manage job opportunities with detailed descriptions
- **Job Moderation**: Review and approve job postings before publication
- **Advanced Filtering**: Filter jobs by multiple criteria
- **Expiration Management**: Automatic job post expiration handling

#### Analytics & Reporting
- **Platform Metrics**: Real-time statistics on users, jobs, and applications
- **User Analytics**: Growth trends, engagement metrics, and role distribution
- **University Insights**: Top universities and academic trend analysis
- **Application Statistics**: Success rates, conversion funnels, and trending jobs
- **Export Functionality**: Generate comprehensive reports in various formats

#### System Configuration
- **General Settings**: Configure site name, description, and branding
- **Email Configuration**: SMTP settings for platform communications
- **Security Policies**: Password requirements, session timeouts, and security controls
- **Feature Toggles**: Enable/disable platform features dynamically
- **System Limits**: Configure usage quotas and rate limits
- **Maintenance Mode**: Platform-wide maintenance controls

---

## 🎯 Why CareerBuddy?

### For Students: Your Career Companion
- **Remove Guesswork**: Get data-driven insights on resume quality and job fit
- **Save Time**: AI automates tedious tasks like skill extraction and job matching
- **Expert Guidance**: Access to professional counselors without expensive career services
- **Track Progress**: Visualize your career development journey with comprehensive analytics
- **Increase Success Rate**: Higher application success with ATS-optimized resumes

### For Counselors: Empower Your Impact
- **Scale Your Reach**: Manage more students without compromising quality
- **Data-Driven Insights**: Make informed decisions with comprehensive student analytics
- **Streamlined Workflow**: Centralized platform for all counseling activities
- **Measure Impact**: Track student success metrics and counselor effectiveness
- **Focus on Mentoring**: Automation handles routine tasks, freeing time for meaningful guidance

### For Institutions: Modern Career Services
- **Centralized Platform**: All career services in one comprehensive system
- **Quality Control**: Ensure consistent service quality across all users
- **Analytics & ROI**: Measure the effectiveness of career services
- **Scalability**: Handle growing student populations without proportional cost increases
- **Modern Experience**: Provide students with a professional, tech-forward platform

---

## 🏗️ Tech Stack & Architecture

### Frontend Stack

#### **Next.js 14** (App Router)
**Why?**
- **Server-Side Rendering (SSR)**: Faster initial page loads and better SEO
- **App Router**: Improved routing with React Server Components
- **API Routes**: Built-in API endpoints for serverless functions
- **Image Optimization**: Automatic image optimization for better performance
- **TypeScript Support**: First-class TypeScript integration

#### **TypeScript 5.2**
**Why?**
- **Type Safety**: Catch errors at compile-time, not runtime
- **Better IDE Support**: Enhanced autocomplete and refactoring capabilities
- **Code Documentation**: Types serve as living documentation
- **Scalability**: Easier to maintain and refactor large codebases
- **Team Collaboration**: Clear contracts between components and modules

#### **TailwindCSS 3.3**
**Why?**
- **Utility-First**: Rapid UI development with utility classes
- **Customization**: Highly customizable design system
- **Performance**: Purges unused CSS for minimal bundle size
- **Responsive**: Mobile-first responsive design built-in
- **Dark Mode**: Easy theme switching support

#### **shadcn/ui**
**Why?**
- **Component Library**: Pre-built, accessible UI components
- **Customizable**: Full control over component styling
- **Radix UI**: Built on top of Radix UI primitives for accessibility
- **Copy-Paste**: Components are yours to own and modify
- **TypeScript**: Fully typed components

#### **React Query (TanStack Query) 5.0**
**Why?**
- **Server State Management**: Efficient caching and synchronization
- **Automatic Refetching**: Keep data fresh automatically
- **Optimistic Updates**: Better UX with instant UI updates
- **DevTools**: Powerful debugging capabilities
- **Query Invalidation**: Smart cache invalidation strategies

#### **Zustand 4.4**
**Why?**
- **Simple State Management**: Minimal