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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { 
  MessageCircle,
  FileText,
  Star,
  TrendingUp,
  User,
  Calendar,
  Clock,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface StudentFeedback {
  _id: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  type: 'PROGRESS_REPORT' | 'RESUME_FEEDBACK' | 'SESSION_NOTES' | 'GENERAL_FEEDBACK';
  category: string;
  title: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProgressReport {
  _id: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  reportPeriod: {
    startDate: string;
    endDate: string;
  };
  metrics: {
    sessionsCompleted: number;
    resumesImproved: number;
    applicationsSubmitted: number;
    skillsAssessed: number;
  };
  achievements: string[];
  challenges: string[];
  recommendations: string[];
  overallRating: number;
  createdAt: string;
}

interface FeedbackFormData {
  studentId: string;
  type: string;
  category: string;
  title: string;
  content: string;
  priority: string;
}

export default function CounselorFeedbackPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [feedbacks, setFeedbacks] = useState<StudentFeedback[]>([]);
  const [progressReports, setProgressReports] = useState<ProgressReport[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState<StudentFeedback | null>(null);
  const [selectedReport, setSelectedReport] = useState<ProgressReport | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [formData, setFormData] = useState<FeedbackFormData>({
    studentId: '',
    type: 'GENERAL_FEEDBACK',
    category: '',
    title: '',
    content: '',
    priority: 'MEDIUM',
  });

  useEffect(() => {
    if (!user || user.role !== 'COUNSELOR') {
      router.push('/auth/login');
      return;
    }
    
    fetchFeedbacks();
    fetchProgressReports();
    fetchStudents();
  }, [user, router, currentPage, typeFilter, priorityFilter]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        type: typeFilter,
        priority: priorityFilter,
        search: searchTerm,
      });

      const data = await apiClient.get(`/counselor/feedback?${params}`);
      setFeedbacks(data.feedbacks);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to fetch feedbacks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load feedback',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressReports = async () => {
    try {
      const data = await apiClient.get('/counselor/progress-reports');
      setProgressReports(data.reports);
    } catch (error) {
      console.error('Failed to fetch progress reports:', error);
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

  const handleCreateFeedback = async () => {
    try {
      await apiClient.post('/counselor/feedback', formData);
      toast({
        title: 'Success',
        description: 'Feedback submitted successfully',
      });
      setIsCreateDialogOpen(false);
      resetForm();
      fetchFeedbacks();
    } catch (error) {
      console.error('Failed to create feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAsRead = async (feedbackId: string) => {
    try {
      await apiClient.put(`/counselor/feedback/${feedbackId}/read`);
      fetchFeedbacks();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      type: 'GENERAL_FEEDBACK',
      category: '',
      title: '',
      content: '',
      priority: 'MEDIUM',
    });
  };

  const handleViewFeedback = (feedback: StudentFeedback) => {
    setSelectedFeedback(feedback);
    setIsViewDialogOpen(true);
    if (!feedback.isRead) {
      handleMarkAsRead(feedback._id);
    }
  };

  const handleViewReport = (report: ProgressReport) => {
    setSelectedReport(report);
    setIsReportDialogOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'URGENT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PROGRESS_REPORT': return 'bg-blue-100 text-blue-800';
      case 'RESUME_FEEDBACK': return 'bg-purple-100 text-purple-800';
      case 'SESSION_NOTES': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'LOW': return <Info className="h-4 w-4" />;
      case 'MEDIUM': return <AlertCircle className="h-4 w-4" />;
      case 'HIGH': return <AlertCircle className="h-4 w-4" />;
      case 'URGENT': return <XCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = 
      feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.content.toLowerCase().includes(searchTerm.toLowerCase());
    
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
                  <MessageCircle className="h-8 w-8 text-blue-600 mr-3" />
                  Student Feedback & Reports
                </h1>
                <p className="text-gray-600 mt-1">Manage student feedback and progress reports</p>
              </div>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Feedback
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="feedback" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="feedback" className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-2" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Progress Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feedback" className="space-y-6">
            {/* Filters and Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search feedback by title, student, or content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="progress_report">Progress Report</SelectItem>
                      <SelectItem value="resume_feedback">Resume Feedback</SelectItem>
                      <SelectItem value="session_notes">Session Notes</SelectItem>
                      <SelectItem value="general_feedback">General Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Feedback List */}
            <div className="space-y-4">
              {filteredFeedbacks.map((feedback) => (
                <motion.div
                  key={feedback._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow ${
                    !feedback.isRead ? 'border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{feedback.title}</h3>
                          {!feedback.isRead && (
                            <Badge className="bg-blue-100 text-blue-800">New</Badge>
                          )}
                          <Badge className={getTypeColor(feedback.type)}>
                            {feedback.type.replace('_', ' ')}
                          </Badge>
                          <Badge className={getPriorityColor(feedback.priority)}>
                            <span className="flex items-center space-x-1">
                              {getPriorityIcon(feedback.priority)}
                              <span>{feedback.priority}</span>
                            </span>
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {feedback.student.firstName} {feedback.student.lastName}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            {feedback.category}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm line-clamp-2">{feedback.content}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewFeedback(feedback)}
                        >
                          <Eye className="h-4 w-4" />
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
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            {/* Progress Reports */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {progressReports.map((report) => (
                <motion.div
                  key={report._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {report.student.firstName} {report.student.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{report.student.email}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= report.overallRating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="text-sm text-gray-600">
                        Period: {new Date(report.reportPeriod.startDate).toLocaleDateString()} - {new Date(report.reportPeriod.endDate).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                      <div className="bg-blue-50 rounded p-2">
                        <div className="text-lg font-semibold text-blue-600">{report.metrics.sessionsCompleted}</div>
                        <div className="text-xs text-gray-600">Sessions</div>
                      </div>
                      <div className="bg-green-50 rounded p-2">
                        <div className="text-lg font-semibold text-green-600">{report.metrics.applicationsSubmitted}</div>
                        <div className="text-xs text-gray-600">Applications</div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewReport(report)}
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Report
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Feedback Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Student Feedback</DialogTitle>
            <DialogDescription>
              Provide feedback or notes for one of your students
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
            <div>
              <Label htmlFor="type">Feedback Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROGRESS_REPORT">Progress Report</SelectItem>
                  <SelectItem value="RESUME_FEEDBACK">Resume Feedback</SelectItem>
                  <SelectItem value="SESSION_NOTES">Session Notes</SelectItem>
                  <SelectItem value="GENERAL_FEEDBACK">General Feedback</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                placeholder="e.g., Resume Review, Career Planning"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Brief title for the feedback"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="content">Feedback Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                placeholder="Detailed feedback and recommendations..."
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFeedback}>
              Submit Feedback
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Feedback Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedFeedback?.title}</DialogTitle>
            <DialogDescription>
              Feedback for {selectedFeedback?.student.firstName} {selectedFeedback?.student.lastName}
            </DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Badge className={getTypeColor(selectedFeedback.type)}>
                    {selectedFeedback.type.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Badge className={getPriorityColor(selectedFeedback.priority)}>
                    <span className="flex items-center space-x-1">
                      {getPriorityIcon(selectedFeedback.priority)}
                      <span>{selectedFeedback.priority}</span>
                    </span>
                  </Badge>
                </div>
                <div>
                  <Label>Category</Label>
                  <p className="text-sm text-gray-600">{selectedFeedback.category}</p>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedFeedback.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div>
                <Label>Feedback Content</Label>
                <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded mt-2 whitespace-pre-wrap">
                  {selectedFeedback.content}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Progress Report Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Progress Report</DialogTitle>
            <DialogDescription>
              Progress report for {selectedReport?.student.firstName} {selectedReport?.student.lastName}
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Report Period</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedReport.reportPeriod.startDate).toLocaleDateString()} - {new Date(selectedReport.reportPeriod.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label>Overall Rating</Label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= selectedReport.overallRating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">
                      {selectedReport.overallRating}/5
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <Label>Metrics</Label>
                <div className="grid grid-cols-4 gap-4 mt-2">
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <div className="text-2xl font-bold text-blue-600">{selectedReport.metrics.sessionsCompleted}</div>
                    <div className="text-sm text-gray-600">Sessions Completed</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded">
                    <div className="text-2xl font-bold text-purple-600">{selectedReport.metrics.resumesImproved}</div>
                    <div className="text-sm text-gray-600">Resumes Improved</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <div className="text-2xl font-bold text-green-600">{selectedReport.metrics.applicationsSubmitted}</div>
                    <div className="text-sm text-gray-600">Applications Submitted</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded">
                    <div className="text-2xl font-bold text-orange-600">{selectedReport.metrics.skillsAssessed}</div>
                    <div className="text-sm text-gray-600">Skills Assessed</div>
                  </div>
                </div>
              </div>

              <div>
                <Label>Achievements</Label>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                  {selectedReport.achievements.map((achievement, index) => (
                    <li key={index}>{achievement}</li>
                  ))}
                </ul>
              </div>

              <div>
                <Label>Challenges</Label>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                  {selectedReport.challenges.map((challenge, index) => (
                    <li key={index}>{challenge}</li>
                  ))}
                </ul>
              </div>

              <div>
                <Label>Recommendations</Label>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                  {selectedReport.recommendations.map((recommendation, index) => (
                    <li key={index}>{recommendation}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
