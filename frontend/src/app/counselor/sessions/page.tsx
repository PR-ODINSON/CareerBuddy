'use client';

import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  User,
  Video,
  Phone,
  MapPin,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Star,
  MessageCircle,
  FileText
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface CounselingSession {
  _id: string;
  title: string;
  description?: string;
  type: 'RESUME_REVIEW' | 'CAREER_PLANNING' | 'INTERVIEW_PREP' | 'JOB_SEARCH' | 'GENERAL';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  scheduledAt: string;
  duration: number;
  notes?: string;
  feedback?: string;
  rating?: number;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}

interface SessionFormData {
  studentId: string;
  title: string;
  description: string;
  type: string;
  scheduledAt: string;
  duration: number;
}

export default function CounselorSessionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [sessions, setSessions] = useState<CounselingSession[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedSession, setSelectedSession] = useState<CounselingSession | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [formData, setFormData] = useState<SessionFormData>({
    studentId: '',
    title: '',
    description: '',
    type: 'GENERAL',
    scheduledAt: '',
    duration: 60,
  });

  useEffect(() => {
    if (!user || user.role !== 'COUNSELOR') {
      router.push('/auth/login');
      return;
    }
    
    // Check if we should open create dialog with pre-selected student
    const studentId = searchParams.get('studentId');
    const action = searchParams.get('action');
    
    if (studentId && action === 'schedule') {
      setFormData(prev => ({ ...prev, studentId }));
      setIsCreateDialogOpen(true);
    }
    
    fetchSessions();
    fetchStudents();
  }, [user, router, currentPage, statusFilter, typeFilter]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        status: statusFilter,
        type: typeFilter,
        search: searchTerm,
      });

      const data = await apiClient.get(`/counselor/sessions?${params}`);
      setSessions(data.sessions);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sessions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await apiClient.get('/counselor/students?limit=100');
      setStudents(data.students);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const handleCreateSession = async () => {
    try {
      await apiClient.post('/counselor/sessions', formData);
      toast({
        title: 'Success',
        description: 'Session scheduled successfully',
      });
      setIsCreateDialogOpen(false);
      resetForm();
      fetchSessions();
    } catch (error) {
      console.error('Failed to create session:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule session',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateSession = async () => {
    if (!selectedSession) return;
    
    try {
      await apiClient.put(`/counselor/sessions/${selectedSession._id}`, formData);
      toast({
        title: 'Success',
        description: 'Session updated successfully',
      });
      setIsEditDialogOpen(false);
      resetForm();
      fetchSessions();
    } catch (error) {
      console.error('Failed to update session:', error);
      toast({
        title: 'Error',
        description: 'Failed to update session',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    
    try {
      await apiClient.delete(`/counselor/sessions/${sessionId}`);
      toast({
        title: 'Success',
        description: 'Session deleted successfully',
      });
      fetchSessions();
    } catch (error) {
      console.error('Failed to delete session:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete session',
        variant: 'destructive',
      });
    }
  };

  const handleStatusUpdate = async (sessionId: string, status: string) => {
    try {
      await apiClient.put(`/counselor/sessions/${sessionId}`, { status });
      toast({
        title: 'Success',
        description: 'Session status updated',
      });
      fetchSessions();
    } catch (error) {
      console.error('Failed to update session status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update session status',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      title: '',
      description: '',
      type: 'GENERAL',
      scheduledAt: '',
      duration: 60,
    });
  };

  const handleEditSession = (session: CounselingSession) => {
    setSelectedSession(session);
    setFormData({
      studentId: session.student._id,
      title: session.title,
      description: session.description || '',
      type: session.type,
      scheduledAt: new Date(session.scheduledAt).toISOString().slice(0, 16),
      duration: session.duration,
    });
    setIsEditDialogOpen(true);
  };

  const handleViewSession = (session: CounselingSession) => {
    setSelectedSession(session);
    setIsViewDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'NO_SHOW': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'RESUME_REVIEW': return 'bg-purple-100 text-purple-800';
      case 'CAREER_PLANNING': return 'bg-blue-100 text-blue-800';
      case 'INTERVIEW_PREP': return 'bg-green-100 text-green-800';
      case 'JOB_SEARCH': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
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
                  <Calendar className="h-8 w-8 text-blue-600 mr-3" />
                  Counseling Sessions
                </h1>
                <p className="text-gray-600 mt-1">Schedule and manage your counseling sessions</p>
              </div>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Session
            </Button>
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
                    placeholder="Search sessions by title or student name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="resume_review">Resume Review</SelectItem>
                  <SelectItem value="career_planning">Career Planning</SelectItem>
                  <SelectItem value="interview_prep">Interview Prep</SelectItem>
                  <SelectItem value="job_search">Job Search</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sessions List */}
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <motion.div
              key={session._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{session.title}</h3>
                      <Badge className={getStatusColor(session.status)}>
                        {session.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getTypeColor(session.type)}>
                        {session.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {session.student.firstName} {session.student.lastName}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(session.scheduledAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {session.duration} min
                      </div>
                    </div>
                    
                    {session.description && (
                      <p className="text-gray-600 text-sm mb-3">{session.description}</p>
                    )}
                    
                    {session.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">{session.rating}/5</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewSession(session)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditSession(session)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {session.status === 'SCHEDULED' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusUpdate(session._id, 'IN_PROGRESS')}
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusUpdate(session._id, 'CANCELLED')}
                        >
                          <XCircle className="h-4 w-4 text-red-500" />
                        </Button>
                      </>
                    )}
                    {session.status === 'IN_PROGRESS' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusUpdate(session._id, 'COMPLETED')}
                      >
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSession(session._id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
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

      {/* Create Session Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule New Session</DialogTitle>
            <DialogDescription>
              Schedule a counseling session with one of your students
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="student">Student</Label>
              <Select value={formData.studentId} onValueChange={(value) => setFormData({...formData, studentId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student._id} value={student._id}>
                      {student.firstName} {student.lastName} - {student.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="title">Session Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Resume Review Session"
              />
            </div>
            <div>
              <Label htmlFor="type">Session Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RESUME_REVIEW">Resume Review</SelectItem>
                  <SelectItem value="CAREER_PLANNING">Career Planning</SelectItem>
                  <SelectItem value="INTERVIEW_PREP">Interview Preparation</SelectItem>
                  <SelectItem value="JOB_SEARCH">Job Search Strategy</SelectItem>
                  <SelectItem value="GENERAL">General Counseling</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                min="15"
                max="180"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="scheduledAt">Scheduled Date & Time</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({...formData, scheduledAt: e.target.value})}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Session agenda and objectives..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSession}>
              Schedule Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Session Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Session</DialogTitle>
            <DialogDescription>
              Update session details
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="edit-title">Session Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-type">Session Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RESUME_REVIEW">Resume Review</SelectItem>
                  <SelectItem value="CAREER_PLANNING">Career Planning</SelectItem>
                  <SelectItem value="INTERVIEW_PREP">Interview Preparation</SelectItem>
                  <SelectItem value="JOB_SEARCH">Job Search Strategy</SelectItem>
                  <SelectItem value="GENERAL">General Counseling</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-duration">Duration (minutes)</Label>
              <Input
                id="edit-duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                min="15"
                max="180"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit-scheduledAt">Scheduled Date & Time</Label>
              <Input
                id="edit-scheduledAt"
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({...formData, scheduledAt: e.target.value})}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSession}>
              Update Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Session Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedSession?.title}</DialogTitle>
            <DialogDescription>
              Session Details and Notes
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Student</Label>
                  <p className="text-sm text-gray-600">
                    {selectedSession.student.firstName} {selectedSession.student.lastName}
                  </p>
                </div>
                <div>
                  <Label>Type</Label>
                  <Badge className={getTypeColor(selectedSession.type)}>
                    {selectedSession.type.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedSession.status)}>
                    {selectedSession.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label>Duration</Label>
                  <p className="text-sm text-gray-600">{selectedSession.duration} minutes</p>
                </div>
                <div>
                  <Label>Scheduled Date</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedSession.scheduledAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label>Scheduled Time</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedSession.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              
              {selectedSession.description && (
                <div>
                  <Label>Description</Label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedSession.description}
                  </p>
                </div>
              )}
              
              {selectedSession.notes && (
                <div>
                  <Label>Session Notes</Label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedSession.notes}
                  </p>
                </div>
              )}
              
              {selectedSession.feedback && (
                <div>
                  <Label>Student Feedback</Label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedSession.feedback}
                  </p>
                </div>
              )}
              
              {selectedSession.rating && (
                <div>
                  <Label>Rating</Label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= selectedSession.rating!
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">
                      {selectedSession.rating}/5
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
