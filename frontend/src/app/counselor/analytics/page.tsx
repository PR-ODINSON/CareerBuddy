'use client';

import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { 
  TrendingUp,
  Users,
  Calendar,
  Star,
  Clock,
  Target,
  Award,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  ArrowLeft,
  Download,
  RefreshCw,
  User,
  GraduationCap,
  Briefcase,
  MessageCircle
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface CounselorAnalytics {
  overview: {
    totalStudents: number;
    activeStudents: number;
    totalSessions: number;
    completedSessions: number;
    averageRating: number;
    successRate: number;
  };
  performance: {
    monthlyStats: {
      month: string;
      sessions: number;
      students: number;
      rating: number;
    }[];
    sessionTypes: {
      type: string;
      count: number;
      percentage: number;
    }[];
    studentProgress: {
      improved: number;
      maintained: number;
      needsAttention: number;
    };
  };
  students: {
    topPerformers: {
      _id: string;
      name: string;
      progress: number;
      achievements: number;
    }[];
    recentActivity: {
      _id: string;
      name: string;
      action: string;
      date: string;
    }[];
  };
  goals: {
    current: {
      target: string;
      progress: number;
      deadline: string;
    }[];
    achievements: {
      title: string;
      date: string;
      description: string;
    }[];
  };
}

interface StudentPerformance {
  _id: string;
  student: {
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  metrics: {
    sessionsAttended: number;
    goalsAchieved: number;
    resumeScore: number;
    applicationSuccess: number;
    engagementLevel: number;
  };
  progress: {
    profileCompletion: number;
    skillDevelopment: number;
    careerReadiness: number;
  };
  lastActivity: string;
  trend: 'improving' | 'stable' | 'declining';
}

export default function CounselorAnalyticsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [analytics, setAnalytics] = useState<CounselorAnalytics | null>(null);
  const [studentPerformance, setStudentPerformance] = useState<StudentPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('3months');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'COUNSELOR') {
      router.push('/auth/login');
      return;
    }
    
    fetchAnalytics();
    fetchStudentPerformance();
  }, [user, router, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get(`/counselor/analytics/overview?timeRange=${timeRange}`);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentPerformance = async () => {
    try {
      const data = await apiClient.get(`/counselor/analytics/students?timeRange=${timeRange}`);
      setStudentPerformance(data.students);
    } catch (error) {
      console.error('Failed to fetch student performance:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchAnalytics(), fetchStudentPerformance()]);
    setRefreshing(false);
    toast({
      title: 'Success',
      description: 'Analytics data refreshed',
    });
  };

  const exportReport = async () => {
    try {
      const response = await apiClient.get(`/counselor/analytics/export?timeRange=${timeRange}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `counselor-analytics-${timeRange}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast({
        title: 'Success',
        description: 'Analytics report downloaded',
      });
    } catch (error) {
      console.error('Failed to export report:', error);
      toast({
        title: 'Error',
        description: 'Failed to export report',
        variant: 'destructive',
      });
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600';
      case 'stable': return 'text-blue-600';
      case 'declining': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4" />;
      case 'stable': return <Activity className="h-4 w-4" />;
      case 'declining': return <TrendingUp className="h-4 w-4 transform rotate-180" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/counselor')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
                  Analytics & Performance
                </h1>
                <p className="text-gray-600 mt-1">Track your counseling effectiveness and student progress</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">Last Month</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={exportReport}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {analytics && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="students" className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Students
              </TabsTrigger>
              <TabsTrigger value="goals" className="flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Goals
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Students</p>
                        <p className="text-3xl font-bold text-blue-600">{analytics.overview.totalStudents}</p>
                        <p className="text-sm text-gray-500">
                          {analytics.overview.activeStudents} active
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                        <p className="text-3xl font-bold text-green-600">{analytics.overview.totalSessions}</p>
                        <p className="text-sm text-gray-500">
                          {analytics.overview.completedSessions} completed
                        </p>
                      </div>
                      <Calendar className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Average Rating</p>
                        <p className="text-3xl font-bold text-yellow-600">{analytics.overview.averageRating.toFixed(1)}</p>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= analytics.overview.averageRating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <Star className="h-8 w-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Success Rate</p>
                        <p className="text-3xl font-bold text-purple-600">{analytics.overview.successRate}%</p>
                        <p className="text-sm text-gray-500">Student improvement</p>
                      </div>
                      <Award className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Student Activity</CardTitle>
                  <CardDescription>Latest activities from your students</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.students.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{activity.name}</p>
                          <p className="text-sm text-gray-600">{activity.action}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(activity.date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              {/* Monthly Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Performance Trends</CardTitle>
                  <CardDescription>Track your counseling performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.performance.monthlyStats.map((stat, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{stat.month}</p>
                          <p className="text-sm text-gray-600">{stat.sessions} sessions with {stat.students} students</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Rating</p>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="font-medium">{stat.rating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Session Types */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Session Types Distribution</CardTitle>
                    <CardDescription>Breakdown of your counseling sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.performance.sessionTypes.map((type, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            {type.type.replace('_', ' ')}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${type.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-12 text-right">
                              {type.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Student Progress Overview</CardTitle>
                    <CardDescription>How your students are performing</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-800">Improved</span>
                        </div>
                        <span className="text-2xl font-bold text-green-600">
                          {analytics.performance.studentProgress.improved}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Activity className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-blue-800">Maintained</span>
                        </div>
                        <span className="text-2xl font-bold text-blue-600">
                          {analytics.performance.studentProgress.maintained}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5 text-orange-600" />
                          <span className="font-medium text-orange-800">Needs Attention</span>
                        </div>
                        <span className="text-2xl font-bold text-orange-600">
                          {analytics.performance.studentProgress.needsAttention}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="students" className="space-y-6">
              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Students</CardTitle>
                  <CardDescription>Students showing exceptional progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analytics.students.topPerformers.map((student, index) => (
                      <div key={student._id} className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-purple-50">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-600">#{index + 1} Performer</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{student.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${student.progress}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-600">
                            {student.achievements} achievements
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Student Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Student Performance Details</CardTitle>
                  <CardDescription>Comprehensive view of all your students</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {studentPerformance.map((student) => (
                      <motion.div
                        key={student._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              {student.student.avatar ? (
                                <img src={student.student.avatar} alt="" className="w-12 h-12 rounded-full" />
                              ) : (
                                <User className="h-6 w-6 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {student.student.firstName} {student.student.lastName}
                              </h3>
                              <p className="text-sm text-gray-600">{student.student.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getTrendColor(student.trend)}>
                              <span className="flex items-center space-x-1">
                                {getTrendIcon(student.trend)}
                                <span>{student.trend}</span>
                              </span>
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-lg font-semibold text-blue-600">{student.metrics.sessionsAttended}</p>
                            <p className="text-xs text-gray-600">Sessions</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold text-green-600">{student.metrics.goalsAchieved}</p>
                            <p className="text-xs text-gray-600">Goals</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold text-purple-600">{student.metrics.resumeScore}%</p>
                            <p className="text-xs text-gray-600">Resume Score</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold text-orange-600">{student.metrics.applicationSuccess}%</p>
                            <p className="text-xs text-gray-600">App Success</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold text-red-600">{student.metrics.engagementLevel}%</p>
                            <p className="text-xs text-gray-600">Engagement</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Profile Completion</span>
                            <span>{student.progress.profileCompletion}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${student.progress.profileCompletion}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="mt-3 text-sm text-gray-600">
                          Last activity: {new Date(student.lastActivity).toLocaleDateString()}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="goals" className="space-y-6">
              {/* Current Goals */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Goals</CardTitle>
                  <CardDescription>Track your professional development goals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.goals.current.map((goal, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900">{goal.target}</h3>
                          <Badge variant="outline">
                            Due: {new Date(goal.deadline).toLocaleDateString()}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{goal.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${goal.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Achievements</CardTitle>
                  <CardDescription>Your counseling milestones and accomplishments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.goals.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg">
                        <Award className="h-6 w-6 text-green-600 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-medium text-green-900">{achievement.title}</h3>
                          <p className="text-sm text-green-700 mb-1">{achievement.description}</p>
                          <p className="text-xs text-green-600">
                            Achieved on {new Date(achievement.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
