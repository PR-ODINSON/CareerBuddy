'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Search, 
  Briefcase, 
  TrendingUp, 
  Users, 
  Calendar,
  Star,
  ArrowRight,
  Target,
  Clock,
  Award,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { useResumes, useApplicationStats, useJobRecommendations } from '@/hooks/useApi';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: resumes, isLoading: resumesLoading } = useResumes();
  const { data: applicationStats, isLoading: statsLoading } = useApplicationStats();
  const { data: jobRecommendations, isLoading: recommendationsLoading } = useJobRecommendations();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const quickStats = [
    { 
      icon: FileText, 
      label: 'Resumes', 
      value: resumesLoading ? '...' : (resumes?.length || 0).toString(), 
      change: resumes?.filter((r: any) => new Date(r.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length > 0 ? '+1 this week' : 'Upload your first resume',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    { 
      icon: Search, 
      label: 'Job Matches', 
      value: recommendationsLoading ? '...' : (jobRecommendations?.length || 0).toString(), 
      change: jobRecommendations?.length > 0 ? `${jobRecommendations.length} new matches` : 'Complete your profile',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    { 
      icon: Briefcase, 
      label: 'Applications', 
      value: statsLoading ? '...' : (applicationStats?.totalApplications || 0).toString(), 
      change: applicationStats?.pendingApplications ? `${applicationStats.pendingApplications} pending` : 'No applications yet',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    { 
      icon: TrendingUp, 
      label: 'Profile Score', 
      value: statsLoading ? '...' : '85%', 
      change: '+12% this month',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
  ];

  const quickActions = [
    {
      icon: Search,
      title: 'Find Jobs',
      description: 'Discover new opportunities that match your skills',
      href: '/dashboard/jobs',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      icon: FileText,
      title: 'Update Resume',
      description: 'Keep your resume fresh and optimized',
      href: '/dashboard/resumes',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      icon: Briefcase,
      title: 'Track Applications',
      description: 'Monitor your application progress',
      href: '/dashboard/applications',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
  ];

  const recentActivity = [
    {
      icon: Star,
      title: 'Profile viewed by TechCorp',
      time: '2 hours ago',
      type: 'view'
    },
    {
      icon: FileText,
      title: 'Resume updated successfully',
      time: '1 day ago',
      type: 'update'
    },
    {
      icon: Briefcase,
      title: 'Applied to Software Engineer at StartupXYZ',
      time: '2 days ago',
      type: 'application'
    },
    {
      icon: Users,
      title: 'Career counseling session completed',
      time: '1 week ago',
      type: 'session'
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Welcome Section */}
        <motion.div variants={itemVariants} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user.firstName}! 🌟
              </h2>
              <p className="text-gray-600 text-lg">
                {user.university} • {user.major} • Class of {user.graduationYear}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Ready to take the next step in your career journey?
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Target className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className={`${stat.bgColor} rounded-lg p-6 border ${stat.borderColor}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="group"
                >
                  <Link href={action.href}>
                    <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-white">
                      <CardContent className="p-6">
                        <div className={`w-12 h-12 ${action.bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <action.icon className={`h-6 w-6 ${action.textColor}`} />
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">{action.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                        <div className="flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                          Get started
                          <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <Card>
              <CardContent className="p-0">
                <div className="space-y-4 p-6">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <activity.icon className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <div className="flex items-center mt-1">
                          <Clock className="h-3 w-3 text-gray-400 mr-1" />
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-6 py-3 bg-gray-50 border-t">
                  <Link href="/dashboard/activity" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    View all activity →
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tips & Recommendations */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">💡 Today's Career Tip</h3>
                  <p className="text-gray-700 mb-4">
                    Customize your resume for each job application. Highlight skills and experiences that directly relate to the job requirements to increase your chances of getting noticed by recruiters.
                  </p>
                  <Button variant="outline" size="sm" className="border-indigo-300 text-indigo-600 hover:bg-indigo-50">
                    Learn more
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
