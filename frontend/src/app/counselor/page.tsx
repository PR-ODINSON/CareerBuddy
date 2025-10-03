'use client';

import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar,
  MessageCircle,
  FileText,
  TrendingUp,
  Star,
  Clock,
  BookOpen,
  Target,
  Award,
  CheckCircle,
  AlertCircle,
  User,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface DashboardOverview {
  stats: {
    totalStudents: number;
    totalSessions: number;
    upcomingSessions: number;
    pendingFeedback: number;
    completedSessions: number;
    averageRating: number;
  };
  recentActivity: {
    sessions: any[];
    feedback: any[];
  };
}

interface Student {
  assignment: {
    id: string;
    assignedAt: string;
    notes: string;
    expiresAt?: string;
  };
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    university: string;
    major: string;
    graduationYear: number;
    gpa?: number;
    resumes: any[];
    applications: any[];
  };
}

export default function CounselorDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user || user.role !== 'COUNSELOR') {
      router.push('/auth/login');
      return;
    }
    fetchDashboardData();
  }, [user, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewData, studentsData] = await Promise.all([
        apiClient.get('/counselor/analytics/overview'),
        apiClient.get('/counselor/students?page=1&limit=10')
      ]);
      setOverview(overviewData);
      setStudents(studentsData.students);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });

      const data = await apiClient.get(`/counselor/students?${params}`);
      setStudents(data.students);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast({
        title: 'Error',
        description: 'Failed to load students',
        variant: 'destructive',
      });
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'COUNSELOR') {
      fetchStudents();
    }
  }, [currentPage, user]);

  const filteredStudents = students.filter(({ student }) => 
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.major.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      label: 'Assigned Students', 
      value: overview?.stats.totalStudents || 0, 
      change: 'Active assignments',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    { 
      icon: Calendar, 
      label: 'Upcoming Sessions', 
      value: overview?.stats.upcomingSessions || 0, 
      change: `${overview?.stats.completedSessions || 0} completed`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    { 
      icon: MessageCircle, 
      label: 'Pending Feedback', 
      value: overview?.stats.pendingFeedback || 0, 
      change: 'Requires attention',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    { 
      icon: Star, 
      label: 'Average Rating', 
      value: overview?.stats.averageRating?.toFixed(1) || '0.0', 
      change: 'From student feedback',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <MessageCircle className="h-8 w-8 text-purple-600 mr-3" />
                Counselor Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Manage your students and provide career guidance</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Session
              </Button>
              <Button onClick={() => router.push('/auth/login')} variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.firstName}! 🌟
              </h2>
              <p className="text-gray-600 text-lg">
                {user?.certification ? `${user.certification} • ` : ''}Career Counselor
              </p>
              {user?.specialization && (
                <p className="text-sm text-gray-500 mt-1">
                  Specializing in: {user.specialization.join(', ')}
                </p>
              )}
              <p className="text-sm text-gray-500">
                Help students navigate their career journey with confidence
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
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

        {/* Main Content */}
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="students" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              My Students
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Assigned Students</CardTitle>
                    <CardDescription>
                      Students under your guidance and mentorship
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Assignment
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Students List */}
                <div className="space-y-4">
                  {studentsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No students found
                    </div>
                  ) : (
                    filteredStudents.map(({ assignment, student }) => (
                      <motion.div
                        key={student._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {student.firstName} {student.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">{student.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary">
                                {student.university}
                              </Badge>
                              <Badge variant="outline">
                                {student.major}
                              </Badge>
                              <Badge variant="outline">
                                Class of {student.graduationYear}
                              </Badge>
                              {student.gpa && (
                                <Badge variant="outline">
                                  GPA: {student.gpa}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center">
                                <FileText className="h-3 w-3 mr-1" />
                                {student.resumes?.length || 0} resumes
                              </span>
                              <span className="flex items-center">
                                <Target className="h-3 w-3 mr-1" />
                                {student.applications?.length || 0} applications
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                Assigned {new Date(assignment.assignedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            View Profile
                          </Button>
                          <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4 mr-1" />
                            Schedule
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Sessions</CardTitle>
                  <CardDescription>Sessions scheduled for the next week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {overview?.recentActivity.sessions?.slice(0, 5).map((session, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">
                            {session.studentId?.firstName} {session.studentId?.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {session.topic || 'Career Counseling Session'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {session.scheduledAt ? new Date(session.scheduledAt).toLocaleDateString() : 'TBD'}
                          </p>
                        </div>
                        <Badge variant={session.status === 'SCHEDULED' ? 'default' : 'secondary'}>
                          {session.status || 'Scheduled'}
                        </Badge>
                      </div>
                    )) || (
                      <div className="text-center py-4 text-gray-500">
                        No upcoming sessions
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest counseling activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {overview?.recentActivity.feedback?.slice(0, 5).map((feedback, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <FileText className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            Feedback provided for {feedback.resumeId?.userId?.firstName || 'student'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-4 text-gray-500">
                        No recent activity
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Feedback</CardTitle>
                <CardDescription>
                  Provide feedback on student resumes and progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Feedback management interface coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Student Progress</CardTitle>
                  <CardDescription>Track student improvement over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    Progress charts would go here
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Session Statistics</CardTitle>
                  <CardDescription>Your counseling session performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Sessions</span>
                      <span className="text-sm text-gray-600">{overview?.stats.totalSessions || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Completed Sessions</span>
                      <span className="text-sm text-gray-600">{overview?.stats.completedSessions || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Rating</span>
                      <span className="text-sm text-gray-600">
                        {overview?.stats.averageRating?.toFixed(1) || '0.0'} ⭐
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
