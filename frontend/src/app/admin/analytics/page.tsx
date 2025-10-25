'use client';

import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import UserGrowthChart from '@/components/charts/UserGrowthChart';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { 
  BarChart3,
  TrendingUp,
  Users,
  UserCheck,
  Briefcase,
  FileText,
  Calendar,
  ArrowLeft,
  Download,
  RefreshCw,
  Activity,
  Target,
  Award,
  Building
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    students: number;
    counselors: number;
    newThisWeek: number;
  };
  jobs: {
    total: number;
    active: number;
  };
  applications: {
    total: number;
    newThisWeek: number;
  };
  resumes: {
    total: number;
  };
}

interface UserAnalytics {
  period: string;
  recentRegistrations: number;
  usersByRole: Array<{ role: string; count: number }>;
  topUniversities: Array<{ name: string; count: number }>;
}

interface JobAnalytics {
  totalJobs: number;
  activeJobs: number;
  recentJobs: number;
  inactiveJobs: number;
  jobsByType: Record<string, number>;
  jobsByExperience: Record<string, number>;
}

interface ResumeAnalytics {
  totalResumes: number;
  recentResumes: number;
  analyzedResumes: number;
  averageScore: number;
  analysisRate: number;
}

export default function AdminAnalyticsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [jobAnalytics, setJobAnalytics] = useState<JobAnalytics | null>(null);
  const [resumeAnalytics, setResumeAnalytics] = useState<ResumeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/auth/login');
      return;
    }
    fetchAnalyticsData();
  }, [user, router, period]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch data with individual error handling
      const promises = [
        apiClient.get('/admin/dashboard-stats').catch(err => {
          console.error('Failed to fetch dashboard stats:', err);
          return null;
        }),
        apiClient.get(`/admin/analytics/users?period=${period}`).catch(err => {
          console.error('Failed to fetch user analytics:', err);
          return null;
        }),
        apiClient.get(`/admin/analytics/jobs?period=${period}`).catch(err => {
          console.error('Failed to fetch job analytics:', err);
          return null;
        }),
        apiClient.get(`/admin/analytics/resumes?period=${period}`).catch(err => {
          console.error('Failed to fetch resume analytics:', err);
          return null;
        })
      ];

      const [statsData, analyticsData, jobData, resumeData] = await Promise.all(promises);
      
      if (statsData) setStats(statsData);
      if (analyticsData) setAnalytics(analyticsData);
      if (jobData) setJobAnalytics(jobData);
      if (resumeData) setResumeAnalytics(resumeData);

      // Show toast only if all requests failed
      if (!statsData && !analyticsData && !jobData && !resumeData) {
        toast({
          title: 'Error',
          description: 'Failed to load analytics data',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      toast({
        title: 'Export Started',
        description: 'Analytics data export is being prepared...',
      });
      // In a real implementation, this would trigger a download
    } catch (error) {
      console.error('Failed to export data:', error);
      toast({
        title: 'Error',
        description: 'Failed to export analytics data',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const quickStats = [
    { 
      icon: Users, 
      label: 'Total Users', 
      value: stats?.users.total || 0, 
      change: `+${stats?.users.newThisWeek || 0} this week`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    { 
      icon: UserCheck, 
      label: 'Active Users', 
      value: stats?.users.active || 0, 
      change: `${Math.round(((stats?.users.active || 0) / (stats?.users.total || 1)) * 100)}% of total`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    { 
      icon: Briefcase, 
      label: 'Active Jobs', 
      value: stats?.jobs.active || 0, 
      change: `${stats?.jobs.total} total jobs`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    { 
      icon: TrendingUp, 
      label: 'Applications', 
      value: stats?.applications.total || 0, 
      change: `+${stats?.applications.newThisWeek || 0} this week`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/admin')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
                  Analytics Dashboard
                </h1>
                <p className="text-gray-600 mt-1">Platform insights and performance metrics</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="30d">30 days</SelectItem>
                  <SelectItem value="90d">90 days</SelectItem>
                  <SelectItem value="1y">1 year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchAnalyticsData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {quickStats.map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className={`${stat.bgColor} rounded-lg p-6 border ${stat.borderColor}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <UserGrowthChart period={period} height={300} showControls={false} />

          {/* Role Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                User Role Distribution
              </CardTitle>
              <CardDescription>
                Breakdown of users by their roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.usersByRole && analytics.usersByRole.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.usersByRole.map(role => ({
                          name: role.role.charAt(0) + role.role.slice(1).toLowerCase() + 's',
                          value: role.count,
                          percentage: Math.round((role.count / (stats?.users.total || 1)) * 100)
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {analytics.usersByRole.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              entry.role === 'ADMIN' ? '#EF4444' :
                              entry.role === 'COUNSELOR' ? '#8B5CF6' : '#3B82F6'
                            } 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any, name: any, props: any) => [
                          `${value} users (${props.payload.percentage}%)`,
                          name
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p>No role distribution data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Universities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Top Universities
              </CardTitle>
              <CardDescription>
                Universities with the most registered students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.topUniversities.slice(0, 8).map((university, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                      <span className="text-sm font-medium truncate">
                        {university.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">
                      {university.count}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Application Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Application Metrics
              </CardTitle>
              <CardDescription>
                Job application statistics and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Total Applications</span>
                  <span className="text-lg font-bold text-blue-600">
                    {stats?.applications.total || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">This Week</span>
                  <span className="text-lg font-bold text-green-600">
                    +{stats?.applications.newThisWeek || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Total Resumes</span>
                  <span className="text-lg font-bold text-purple-600">
                    {stats?.resumes.total || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Active Jobs</span>
                  <span className="text-lg font-bold text-orange-600">
                    {stats?.jobs.active || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Job Distribution by Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Jobs by Employment Type
              </CardTitle>
              <CardDescription>
                Distribution of jobs by employment type
              </CardDescription>
            </CardHeader>
            <CardContent>
              {jobAnalytics?.jobsByType && Object.keys(jobAnalytics.jobsByType).length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Object.entries(jobAnalytics.jobsByType).map(([type, count]) => ({
                      type: type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
                      count
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="type" 
                        stroke="#6B7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#6B7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip 
                        formatter={(value: any) => [`${value} jobs`, 'Count']}
                        labelFormatter={(label: any) => `${label}`}
                      />
                      <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p>No job type data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Distribution by Experience Level */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Jobs by Experience Level
              </CardTitle>
              <CardDescription>
                Distribution of jobs by required experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              {jobAnalytics?.jobsByExperience && Object.keys(jobAnalytics.jobsByExperience).length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(jobAnalytics.jobsByExperience).map(([level, count]) => ({
                          name: level.charAt(0) + level.slice(1).toLowerCase(),
                          value: count
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {Object.entries(jobAnalytics.jobsByExperience).map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={[
                              '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6B7280'
                            ][index % 6]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [`${value} jobs`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p>No experience level data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resume Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Resume Analysis Rate
              </CardTitle>
              <CardDescription>
                Percentage of resumes that have been analyzed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {Math.round(resumeAnalytics?.analysisRate || 0)}%
                </div>
                <p className="text-sm text-gray-600">
                  {resumeAnalytics?.analyzedResumes || 0} of {resumeAnalytics?.totalResumes || 0} resumes analyzed
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.round(resumeAnalytics?.analysisRate || 0)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Average ATS Score
              </CardTitle>
              <CardDescription>
                Average ATS compatibility score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {Math.round(resumeAnalytics?.averageScore || 0)}
                </div>
                <p className="text-sm text-gray-600">
                  Out of 100 points
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.round(resumeAnalytics?.averageScore || 0)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Recent resumes uploaded
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  +{resumeAnalytics?.recentResumes || 0}
                </div>
                <p className="text-sm text-gray-600">
                  New resumes this {period === '7d' ? 'week' : period === '30d' ? 'month' : 'period'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Platform Health Overview
            </CardTitle>
            <CardDescription>
              Key performance indicators and system status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">User Engagement</h3>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {Math.round(((stats?.users.active || 0) / (stats?.users.total || 1)) * 100)}%
                </p>
                <p className="text-sm text-gray-600">Active users</p>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Job Placement</h3>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {stats?.jobs.active || 0}
                </p>
                <p className="text-sm text-gray-600">Active opportunities</p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Success Rate</h3>
                <p className="text-2xl font-bold text-purple-600 mt-2">
                  {stats?.users.counselors || 0}
                </p>
                <p className="text-sm text-gray-600">Active counselors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
