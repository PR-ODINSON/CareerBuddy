'use client';

import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Search,
  Crown,
  GraduationCap,
  MessageCircle,
  Shield,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Star,
  Award,
  Building,
  BookOpen,
  ArrowLeft
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  phone?: string;
  bio?: string;
  avatar?: string;
  university?: string;
  major?: string;
  graduationYear?: number;
  gpa?: number;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  targetRoles?: string[];
  preferredIndustries?: string[];
  locationPreferences?: string[];
  salaryExpectation?: number;
  specialization?: string[];
  experience?: number;
  certification?: string;
  rating?: number;
  createdAt: string;
  lastLogin?: string;
}

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  bio?: string;
  university?: string;
  major?: string;
  graduationYear?: number;
  gpa?: number;
  specialization?: string[];
  experience?: number;
  certification?: string;
}

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'STUDENT',
    phone: '',
    bio: '',
    university: '',
    major: '',
    graduationYear: new Date().getFullYear(),
    gpa: 0,
    specialization: [],
    experience: 0,
    certification: ''
  });

  useEffect(() => {
    // Wait for auth to finish loading before making decisions
    if (authLoading) {
      return;
    }
    
    if (!user || user.role !== 'ADMIN') {
      router.push('/auth/login');
      return;
    }
    
    fetchUsers();
  }, [user, authLoading, router, currentPage, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });
      
      if (roleFilter !== 'all') {
        params.append('role', roleFilter.toUpperCase());
      }

      const data = await apiClient.get(`/admin/users?${params}`);
      setUsers(data.users);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate') => {
    try {
      const endpoint = `/admin/users/${userId}/${action}`;
      await apiClient.put(endpoint);
      
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

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await apiClient.delete(`/admin/users/${userToDelete._id}`);
      
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
      
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const confirmDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    try {
      await apiClient.put(`/admin/users/${userId}/role`, { role: newRole });
      
      toast({
        title: 'Success',
        description: 'User role updated successfully',
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      bio: user.bio || '',
      university: user.university || '',
      major: user.major || '',
      graduationYear: user.graduationYear || new Date().getFullYear(),
      gpa: user.gpa || 0,
      specialization: user.specialization || [],
      experience: user.experience || 0,
      certification: user.certification || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleCreateUser = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: 'STUDENT',
      phone: '',
      bio: '',
      university: '',
      major: '',
      graduationYear: new Date().getFullYear(),
      gpa: 0,
      specialization: [],
      experience: 0,
      certification: ''
    });
    setIsCreateDialogOpen(true);
  };

  const handleRoleChange = (newRole: string) => {
    const updatedFormData = { ...formData, role: newRole };
    
    // Reset role-specific fields when role changes
    if (newRole === 'STUDENT') {
      updatedFormData.university = updatedFormData.university || '';
      updatedFormData.major = updatedFormData.major || '';
      updatedFormData.graduationYear = updatedFormData.graduationYear || new Date().getFullYear();
      updatedFormData.gpa = updatedFormData.gpa || 0;
      // Clear counselor fields
      updatedFormData.specialization = [];
      updatedFormData.experience = 0;
      updatedFormData.certification = '';
    } else if (newRole === 'COUNSELOR') {
      updatedFormData.specialization = updatedFormData.specialization || [];
      updatedFormData.experience = updatedFormData.experience || 0;
      updatedFormData.certification = updatedFormData.certification || '';
      // Clear student fields
      updatedFormData.university = '';
      updatedFormData.major = '';
      updatedFormData.graduationYear = undefined;
      updatedFormData.gpa = undefined;
    } else {
      // ADMIN - clear all role-specific fields
      updatedFormData.university = '';
      updatedFormData.major = '';
      updatedFormData.graduationYear = undefined;
      updatedFormData.gpa = undefined;
      updatedFormData.specialization = [];
      updatedFormData.experience = 0;
      updatedFormData.certification = '';
    }
    
    setFormData(updatedFormData);
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'First name is required',
        variant: 'destructive',
      });
      return false;
    }
    
    if (!formData.lastName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Last name is required',
        variant: 'destructive',
      });
      return false;
    }
    
    if (!formData.email.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Email is required',
        variant: 'destructive',
      });
      return false;
    }
    
    // Validate role-specific required fields
    if (formData.role === 'STUDENT') {
      if (!formData.university?.trim()) {
        toast({
          title: 'Validation Error',
          description: 'University is required for students',
          variant: 'destructive',
        });
        return false;
      }
      
      if (!formData.major?.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Major is required for students',
          variant: 'destructive',
        });
        return false;
      }
      
      if (!formData.graduationYear || formData.graduationYear < 1900 || formData.graduationYear > 2050) {
        toast({
          title: 'Validation Error',
          description: 'Valid graduation year is required for students',
          variant: 'destructive',
        });
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (isEdit: boolean) => {
    if (!validateForm()) {
      return;
    }
    
    try {
      if (isEdit && selectedUser) {
        await apiClient.put(`/admin/users/${selectedUser._id}`, formData);
        toast({
          title: 'Success',
          description: 'User updated successfully',
        });
        setIsEditDialogOpen(false);
      } else {
        await apiClient.post('/admin/users', { ...formData, password: 'tempPassword123' });
        toast({
          title: 'Success',
          description: 'User created successfully',
        });
        setIsCreateDialogOpen(false);
      }
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to save user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save user';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Crown className="h-5 w-5 text-yellow-600" />;
      case 'COUNSELOR':
        return <MessageCircle className="h-5 w-5 text-purple-600" />;
      default:
        return <GraduationCap className="h-5 w-5 text-blue-600" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'COUNSELOR':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (authLoading || loading) {
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
                onClick={() => router.push('/admin')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Users className="h-8 w-8 text-blue-600 mr-3" />
                  User Management
                </h1>
                <p className="text-gray-600 mt-1">Manage all users across the platform</p>
              </div>
            </div>
            <Button onClick={handleCreateUser}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users by name or email..."
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-200"
            >
              {/* Card Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                      user.role === 'ADMIN' ? 'bg-red-100' : 
                      user.role === 'COUNSELOR' ? 'bg-purple-100' : 'bg-blue-100'
                    }`}>
                      {getRoleIcon(user.role)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-gray-900 truncate">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                          {user.role}
                        </Badge>
                        <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className={`text-xs font-medium ${user.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                      className="h-8 w-8 p-0 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => confirmDeleteUser(user)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="px-6 pb-4">
                <div className="space-y-3">
                  {/* Verification Status */}
                  {user.isVerified && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-medium">Verified Account</span>
                    </div>
                  )}

                  {/* Contact Information */}
                  {user.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{user.phone}</span>
                    </div>
                  )}

                  {/* Role-specific Information */}
                  {user.role === 'STUDENT' && (
                    <div className="space-y-2">
                      {user.university && (
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 truncate">{user.university}</span>
                        </div>
                      )}
                      {user.major && (
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 truncate">{user.major}</span>
                        </div>
                      )}
                      {user.graduationYear && (
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Class of {user.graduationYear}</span>
                        </div>
                      )}
                      {user.gpa && user.gpa > 0 && (
                        <div className="flex items-center space-x-2">
                          <Award className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">GPA: {user.gpa.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {user.role === 'COUNSELOR' && (
                    <div className="space-y-2">
                      {user.experience && user.experience > 0 && (
                        <div className="flex items-center space-x-2">
                          <Award className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{user.experience} years experience</span>
                        </div>
                      )}
                      {user.certification && (
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 truncate">{user.certification}</span>
                        </div>
                      )}
                      {user.rating && (
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-gray-600">{user.rating.toFixed(1)}/5.0 rating</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Last Login */}
                  {user.lastLogin && (
                    <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        Last seen: {new Date(user.lastLogin).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}

                  {/* Join Date */}
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      Joined: {new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-100">
                <div className="flex space-x-2">
                  {user.isActive ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUserAction(user._id, 'deactivate')}
                      className="flex-1 text-orange-600 border-orange-200 hover:bg-orange-50"
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Deactivate
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUserAction(user._id, 'activate')}
                      className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Activate
                    </Button>
                  )}
                  
                  <Select
                    value={user.role}
                    onValueChange={(newRole) => handleRoleUpdate(user._id, newRole)}
                  >
                    <SelectTrigger className="flex-1 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="COUNSELOR">Counselor</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 py-2 text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and settings
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="COUNSELOR">Counselor</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            {formData.role === 'STUDENT' && (
              <>
                <div>
                  <Label htmlFor="university">University</Label>
                  <Input
                    id="university"
                    value={formData.university}
                    onChange={(e) => setFormData({...formData, university: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="major">Major</Label>
                  <Input
                    id="major"
                    value={formData.major}
                    onChange={(e) => setFormData({...formData, major: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="graduationYear">Graduation Year</Label>
                  <Input
                    id="graduationYear"
                    type="number"
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({...formData, graduationYear: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="gpa">GPA</Label>
                  <Input
                    id="gpa"
                    type="number"
                    step="0.1"
                    max="4.0"
                    value={formData.gpa}
                    onChange={(e) => setFormData({...formData, gpa: parseFloat(e.target.value)})}
                  />
                </div>
              </>
            )}
            {formData.role === 'COUNSELOR' && (
              <>
                <div>
                  <Label htmlFor="experience">Experience (years)</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="certification">Certification</Label>
                  <Input
                    id="certification"
                    value={formData.certification}
                    onChange={(e) => setFormData({...formData, certification: e.target.value})}
                  />
                </div>
              </>
            )}
            <div className="col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleSubmit(true)}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the platform
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="COUNSELOR">Counselor</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            {formData.role === 'STUDENT' && (
              <>
                <div>
                  <Label htmlFor="university">University *</Label>
                  <Input
                    id="university"
                    value={formData.university}
                    onChange={(e) => setFormData({...formData, university: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="major">Major *</Label>
                  <Input
                    id="major"
                    value={formData.major}
                    onChange={(e) => setFormData({...formData, major: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="graduationYear">Graduation Year *</Label>
                  <Input
                    id="graduationYear"
                    type="number"
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({...formData, graduationYear: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="gpa">GPA</Label>
                  <Input
                    id="gpa"
                    type="number"
                    step="0.1"
                    max="4.0"
                    min="0"
                    value={formData.gpa}
                    onChange={(e) => setFormData({...formData, gpa: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </>
            )}
            {formData.role === 'COUNSELOR' && (
              <>
                <div>
                  <Label htmlFor="experience">Experience (years)</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="certification">Certification</Label>
                  <Input
                    id="certification"
                    value={formData.certification}
                    onChange={(e) => setFormData({...formData, certification: e.target.value})}
                  />
                </div>
              </>
            )}
            <div className="col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleSubmit(false)}>
              Create User
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {userToDelete && (
            <div className="py-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  {getRoleIcon(userToDelete.role)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {userToDelete.firstName} {userToDelete.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{userToDelete.email}</p>
                  <Badge variant={getRoleBadgeVariant(userToDelete.role)} className="mt-1">
                    {userToDelete.role}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete User
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
