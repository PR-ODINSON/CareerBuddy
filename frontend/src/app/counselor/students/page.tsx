'use client';

import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search,
  Filter,
  MessageCircle,
  Calendar,
  FileText,
  TrendingUp,
  Star,
  Clock,
  User,
  GraduationCap,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  ArrowLeft,
  Plus,
  Eye,
  Edit
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  university?: string;
  major?: string;
  graduationYear?: number;
  gpa?: number;
  targetRoles?: string[];
  preferredIndustries?: string[];
  locationPreferences?: string[];
  assignment: {
    assignedAt: string;
    notes?: string;
  };
  stats: {
    resumesCount: number;
    applicationsCount: number;
    sessionsCount: number;
    lastActivity: string;
  };
  progress: {
    profileCompletion: number;
    resumeScore: number;
    jobMatchScore: number;
  };
}

export default function CounselorStudentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!user || user.role !== 'COUNSELOR') {
      router.push('/auth/login');
      return;
    }
    fetchStudents();
  }, [user, router, currentPage, statusFilter, sortBy]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        status: statusFilter,
        sortBy: sortBy,
        search: searchTerm,
      });

      const data = await apiClient.get(`/counselor/students?${params}`);
      setStudents(data.students);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast({
        title: 'Error',
        description: 'Failed to load students',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchStudents();
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsViewDialogOpen(true);
  };

  const handleProvideFeedback = (student: Student) => {
    setSelectedStudent(student);
    setFeedback('');
    setIsFeedbackDialogOpen(true);
  };

  const submitFeedback = async () => {
    if (!selectedStudent || !feedback.trim()) return;

    try {
      await apiClient.put(`/counselor/students/${selectedStudent._id}/feedback`, {
        feedback: feedback.trim(),
      });
      
      toast({
        title: 'Success',
        description: 'Feedback submitted successfully',
      });
      
      setIsFeedbackDialogOpen(false);
      setFeedback('');
      fetchStudents();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback',
        variant: 'destructive',
      });
    }
  };

  const scheduleSession = (student: Student) => {
    router.push(`/counselor/sessions?studentId=${student._id}&action=schedule`);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.university?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.major?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

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
                  <Users className="h-8 w-8 text-blue-600 mr-3" />
                  My Students
                </h1>
                <p className="text-gray-600 mt-1">Manage and support your assigned students</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {filteredStudents.length} students assigned
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search students by name, email, university, or major..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent Activity</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="assigned">Assignment Date</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <motion.div
              key={student._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      {student.avatar ? (
                        <img src={student.avatar} alt="" className="w-12 h-12 rounded-full" />
                      ) : (
                        <User className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {student.firstName} {student.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </div>
                  </div>
                </div>

                {/* Student Info */}
                <div className="space-y-2 mb-4">
                  {student.university && (
                    <div className="flex items-center text-sm text-gray-600">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      {student.university}
                    </div>
                  )}
                  {student.major && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Briefcase className="h-4 w-4 mr-2" />
                      {student.major}
                    </div>
                  )}
                  {student.graduationYear && (
                    <div className="text-sm text-gray-600">
                      Class of {student.graduationYear}
                    </div>
                  )}
                </div>

                {/* Progress Indicators */}
                <div className="space-y-2 mb-4">
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

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-lg font-semibold text-blue-600">{student.stats.resumesCount}</div>
                    <div className="text-xs text-gray-600">Resumes</div>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-lg font-semibold text-green-600">{student.stats.applicationsCount}</div>
                    <div className="text-xs text-gray-600">Applications</div>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-lg font-semibold text-purple-600">{student.stats.sessionsCount}</div>
                    <div className="text-xs text-gray-600">Sessions</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewStudent(student)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => scheduleSession(student)}
                    className="flex-1"
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Schedule
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleProvideFeedback(student)}
                    className="flex-1"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Feedback
                  </Button>
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

      {/* View Student Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedStudent?.firstName} {selectedStudent?.lastName}
            </DialogTitle>
            <DialogDescription>
              Student Profile and Progress Overview
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{selectedStudent.email}</span>
                  </div>
                  {selectedStudent.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{selectedStudent.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Academic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>University</Label>
                    <p className="text-sm text-gray-600">{selectedStudent.university || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label>Major</Label>
                    <p className="text-sm text-gray-600">{selectedStudent.major || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label>Graduation Year</Label>
                    <p className="text-sm text-gray-600">{selectedStudent.graduationYear || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label>GPA</Label>
                    <p className="text-sm text-gray-600">{selectedStudent.gpa || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Career Preferences */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Career Preferences</h3>
                <div className="space-y-3">
                  <div>
                    <Label>Target Roles</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedStudent.targetRoles?.map((role, index) => (
                        <Badge key={index} variant="secondary">{role}</Badge>
                      )) || <span className="text-sm text-gray-600">Not specified</span>}
                    </div>
                  </div>
                  <div>
                    <Label>Preferred Industries</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedStudent.preferredIndustries?.map((industry, index) => (
                        <Badge key={index} variant="outline">{industry}</Badge>
                      )) || <span className="text-sm text-gray-600">Not specified</span>}
                    </div>
                  </div>
                  <div>
                    <Label>Location Preferences</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedStudent.locationPreferences?.map((location, index) => (
                        <Badge key={index} variant="outline">{location}</Badge>
                      )) || <span className="text-sm text-gray-600">Not specified</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignment Notes */}
              {selectedStudent.assignment.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Assignment Notes</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedStudent.assignment.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Feedback</DialogTitle>
            <DialogDescription>
              Share feedback and guidance for {selectedStudent?.firstName} {selectedStudent?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Enter your feedback and recommendations..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsFeedbackDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitFeedback} disabled={!feedback.trim()}>
                Submit Feedback
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
