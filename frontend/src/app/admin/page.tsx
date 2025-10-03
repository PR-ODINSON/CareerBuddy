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
  UserPlus, 
  UserCheck, 
  UserX, 
  TrendingUp, 
  FileText, 
  Briefcase,
  Settings,
  BarChart3,
  Filter,
  Search,
  Plus,
  Crown,
  GraduationCap,
  MessageCircle,
  Shield,
  Activity
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  university?: string;
  major?: string;
  graduationYear?: number;
  specialization?: string[];
  experience?: number;
  certification?: string;
  rating?: number;
  createdAt: string;
  lastLogin?: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/auth/login');
      return;
    }
    fetchDashboardData();
  }, [user, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData] = await Promise.all([
        apiClient.get('/admin/dashboard-stats'),
        apiClient.get('/admin/users?page=1&limit=10')
      ]);
      setStats(statsData);
      setUsers(usersData.users);
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

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });
      
      if (roleFilter !== 'all') {
        params.append('role', roleFilter.toUpperCase());
      }

      const data = await apiClient.get(`/admin/users?${params}`);
      setUsers(data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchUsers();
    }
  }, [currentPage, roleFilter, user]);

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate' | 'promote' | 'demote') => {
    try {
      let endpoint = '';
      let data = {};

      switch (action) {
        case 'activate':
          endpoint = `/admin/users/${userId}/activate`;
          break;
        case 'deactivate':
          endpoint = `/admin/users/${userId}/deactivate`;
          break;
        case 'promote':
          endpoint = `/admin/users/${userId}/role`;
          data = { role: 'COUNSELOR' };
          break;
        case 'demote':
          endpoint = `/admin/users/${userId}/role`;
          data = { role: 'STUDENT' };
          break;
      }

      await apiClient.put(endpoint, data);
      
      toast({
        title: 'Success',
        description: `User ${action}d successfully`,
      });
      
      fetchUsers();
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${action} user`,
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
      change: `${stats?.users.active}/${stats?.users.total} active`,
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Shield className="h-8 w-8 text-blue-600 mr-3" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Manage users, jobs, and system settings</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
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
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.firstName}! 👑
              </h2>
              <p className="text-gray-600 text-lg">
                System Administrator • CareerBuddy Platform
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Monitor and manage the entire CareerBuddy ecosystem
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Crown className="h-16 w-16 text-white" />
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
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center">
              <Briefcase className="h-4 w-4 mr-2" />
              Job Management
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>
                      Manage users, roles, and permissions across the platform
                    </CardDescription>
                  </div>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="student">Students</SelectItem>
                      <SelectItem value="counselor">Counselors</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Users Table */}
                <div className="space-y-4">
                  {usersLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No users found
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <motion.div
                        key={user._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            {user.role === 'ADMIN' ? (
                              <Crown className="h-6 w-6 text-yellow-600" />
                            ) : user.role === 'COUNSELOR' ? (
                              <MessageCircle className="h-6 w-6 text-purple-600" />
                            ) : (
                              <GraduationCap className="h-6 w-6 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'COUNSELOR' ? 'default' : 'secondary'}>
                                {user.role}
                              </Badge>
                              <Badge variant={user.isActive ? 'default' : 'secondary'}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              {user.isVerified && (
                                <Badge variant="outline">Verified</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {user.isActive ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUserAction(user._id, 'deactivate')}
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUserAction(user._id, 'activate')}
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Activate
                            </Button>
                          )}
                          {user.role === 'STUDENT' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUserAction(user._id, 'promote')}
                            >
                              Promote to Counselor
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>User registration trends over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    Chart component would go here
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Role Distribution</CardTitle>
                  <CardDescription>Breakdown of users by role</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Students</span>
                      <span className="text-sm text-gray-600">{stats?.users.students || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Counselors</span>
                      <span className="text-sm text-gray-600">{stats?.users.counselors || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Admins</span>
                      <span className="text-sm text-gray-600">
                        {(stats?.users.total || 0) - (stats?.users.students || 0) - (stats?.users.counselors || 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Management</CardTitle>
                <CardDescription>
                  Manage job postings and applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Job management interface coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure system-wide settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  System settings interface coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
