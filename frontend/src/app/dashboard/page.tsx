'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, Briefcase, BarChart3, Upload, Search } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  const studentFeatures = [
    {
      icon: Upload,
      title: 'Upload Resume',
      description: 'Upload and get AI-powered feedback on your resume',
      href: '/resumes',
      color: 'text-blue-600',
    },
    {
      icon: Search,
      title: 'Find Jobs',
      description: 'Discover job opportunities tailored to your profile',
      href: '/jobs',
      color: 'text-green-600',
    },
    {
      icon: Briefcase,
      title: 'Track Applications',
      description: 'Monitor your job application progress',
      href: '/applications',
      color: 'text-purple-600',
    },
    {
      icon: Users,
      title: 'Career Counseling',
      description: 'Book sessions with professional counselors',
      href: '/counseling',
      color: 'text-orange-600',
    },
  ];

  const adminFeatures = [
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'View platform statistics and user analytics',
      href: '/admin',
      color: 'text-blue-600',
    },
    {
      icon: Users,
      title: 'User Management',
      description: 'Manage users, counselors, and permissions',
      href: '/admin/users',
      color: 'text-green-600',
    },
    {
      icon: FileText,
      title: 'Content Management',
      description: 'Manage jobs, skills, and platform content',
      href: '/admin/content',
      color: 'text-purple-600',
    },
  ];

  const features = user.role === 'ADMIN' ? adminFeatures : studentFeatures;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.firstName}!
            </h1>
            <p className="text-gray-600">
              {user.role === 'ADMIN' ? 'Admin Dashboard' : 'Your career journey continues here'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{user.email}</span>
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                {user.role}
              </span>
            </div>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resumes</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Applications</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Search className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Job Matches</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <feature.icon className={`h-12 w-12 ${feature.color} mb-4`} />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={feature.href}>
                    Get Started
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-12 text-center">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                🚀 Platform Under Development
              </h3>
              <p className="text-blue-800">
                CareerBuddy is being actively developed. Core features like resume analysis, 
                job recommendations, and AI-powered career guidance are coming soon!
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
