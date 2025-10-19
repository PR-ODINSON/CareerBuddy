'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  useApplications, 
  useApplicationStats, 
  useUpcomingInterviews, 
  useUpdateApplication, 
  useWithdrawApplication,
  useCreateApplication,
  useJobs,
  useResumes
} from '@/hooks/useApi';
import {
  Briefcase,
  Building,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Filter,
  Search,
  MapPin,
  DollarSign,
  ExternalLink,
  Plus,
  TrendingUp,
  Users,
  FileText
} from 'lucide-react';

export default function ApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState('');
  const [selectedResume, setSelectedResume] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [notes, setNotes] = useState('');

  const router = useRouter();
  const { toast } = useToast();
  
  // Fetch applications from API
  const { data: applications = [], isLoading: applicationsLoading, error: applicationsError } = useApplications(statusFilter === 'all' ? undefined : statusFilter);
  const { data: stats } = useApplicationStats();
  const { data: jobs = [], isLoading: jobsLoading } = useJobs();
  const { data: resumes = [], isLoading: resumesLoading } = useResumes();
  const createApplication = useCreateApplication();

  const handleAddApplication = async () => {
    if (!selectedJob || !selectedResume) {
      toast({
        title: "Error",
        description: "Please select both a job and a resume",
        variant: "destructive",
      });
      return;
    }

    try {
      await createApplication.mutateAsync({
        jobId: selectedJob,
        resumeId: selectedResume,
        coverLetter: coverLetter || undefined,
        notes: notes || undefined,
      });
      
      // Reset form
      setSelectedJob('');
      setSelectedResume('');
      setCoverLetter('');
      setNotes('');
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to create application:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPLIED':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'INTERVIEW':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'OFFER':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'REJECTED':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPLIED':
        return <Clock className="h-4 w-4" />;
      case 'INTERVIEW':
        return <AlertCircle className="h-4 w-4" />;
      case 'OFFER':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const statusCounts = {
    applied: Array.isArray(applications) ? applications.filter((app: any) => app.status === 'APPLIED').length : 0,
    interview: Array.isArray(applications) ? applications.filter((app: any) => app.status === 'INTERVIEW').length : 0,
    offer: Array.isArray(applications) ? applications.filter((app: any) => app.status === 'OFFER').length : 0,
    rejected: Array.isArray(applications) ? applications.filter((app: any) => app.status === 'REJECTED').length : 0,
  };

  const filteredApplications = Array.isArray(applications) ? applications.filter((app: any) => {
    const matchesSearch = (app.jobId?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (app.jobId?.company || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

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
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
            <p className="text-gray-600 mt-1">Track and manage your job applications</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              onClick={() => router.push('/dashboard/jobs')}
              variant="outline" 
              size="sm"
            >
              <Search className="h-4 w-4 mr-2" />
              Find Jobs
            </Button>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Application
            </Button>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div variants={itemVariants}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Applications</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.total || (Array.isArray(applications) ? applications.length : 0)}</p>
                  </div>
                  <Briefcase className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.inProgress || (statusCounts.applied + statusCounts.interview)}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Interviews</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.interviews || statusCounts.interview}</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Offers</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.offers || statusCounts.offer}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Applications List */}
        <motion.div variants={itemVariants} className="space-y-4">
          {applicationsLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading applications...</p>
            </div>
          ) : applicationsError ? (
            <div className="text-center py-16">
              <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Applications</h3>
              <p className="text-gray-500 mb-6">There was an error loading your applications. Please try again.</p>
            </div>
          ) : filteredApplications.length > 0 ? (
            filteredApplications.map((application: any, index: number) => (
            <motion.div
              key={application.id}
              variants={itemVariants}
              whileHover={{ y: -2 }}
              className="group"
            >
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center text-2xl border border-gray-200">
                            {application.jobId?.company?.charAt(0) || 'J'}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {application.jobId?.title || 'Job Title'}
                              </h3>
                              <div className="flex items-center space-x-4 mt-1">
                                <div className="flex items-center text-gray-600">
                                  <Building className="h-4 w-4 mr-1" />
                                  <span className="font-medium">{application.jobId?.company || 'Company'}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
                                {getStatusIcon(application.status)}
                                <span className="ml-1 capitalize">{application.status}</span>
                              </span>
                            </div>
                          </div>
                          
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {application.jobId?.location || 'Location not specified'}
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {application.jobId?.salaryRange || 'Salary not specified'}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Applied {new Date(application.appliedAt).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <div className="flex items-center text-sm">
                              <span className="font-medium text-gray-700">Status:</span>
                              <span className="ml-2 text-gray-600 capitalize">{application.status.toLowerCase()}</span>
                            </div>
                            {application.notes && (
                              <div className="flex items-center text-sm mt-1">
                                <span className="font-medium text-gray-700">Notes:</span>
                                <span className="ml-2 text-gray-600">{application.notes}</span>
                              </div>
                            )}
                          </div>
                          
                          {application.coverLetter && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <FileText className="h-4 w-4 inline mr-1" />
                                <strong>Cover Letter:</strong> {application.coverLetter.substring(0, 100)}{application.coverLetter.length > 100 ? '...' : ''}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col lg:items-end space-y-3">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open Job
                        </Button>
                      </div>
                      <div className="text-xs text-gray-500">
                        Resume: {application.resumeId?.title || 'Default Resume'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            ))
          ) : (
            <div className="text-center py-16">
              <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-500 mb-6">Start applying to jobs to track your applications here</p>
              <Button 
                onClick={() => router.push('/dashboard/jobs')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Find Jobs to Apply
              </Button>
            </div>
          )}
        </motion.div>

        {/* Application Pipeline */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Application Pipeline
              </CardTitle>
              <CardDescription>
                Track your applications through different stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{statusCounts.applied}</div>
                  <div className="text-sm font-medium text-blue-800">Applied</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-600">{statusCounts.interview}</div>
                  <div className="text-sm font-medium text-yellow-800">Interview</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{statusCounts.offer}</div>
                  <div className="text-sm font-medium text-green-800">Offers</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-600">{statusCounts.rejected}</div>
                  <div className="text-sm font-medium text-red-800">Rejected</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Add Application Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogClose onClose={() => setShowAddModal(false)} />
          <DialogHeader>
            <DialogTitle>Add New Application</DialogTitle>
            <DialogDescription>
              Create a new job application by selecting a job and resume.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="job-select">Select Job</Label>
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger id="job-select">
                  <SelectValue placeholder="Choose a job..." />
                </SelectTrigger>
                <SelectContent>
                  {jobsLoading ? (
                    <SelectItem value="" disabled>Loading jobs...</SelectItem>
                  ) : Array.isArray(jobs) && jobs.length > 0 ? (
                    jobs.map((job: any) => (
                      <SelectItem key={job._id} value={job._id}>
                        {job.title} - {job.company}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>No jobs available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="resume-select">Select Resume</Label>
              <Select value={selectedResume} onValueChange={setSelectedResume}>
                <SelectTrigger id="resume-select">
                  <SelectValue placeholder="Choose a resume..." />
                </SelectTrigger>
                <SelectContent>
                  {resumesLoading ? (
                    <SelectItem value="" disabled>Loading resumes...</SelectItem>
                  ) : Array.isArray(resumes) && resumes.length > 0 ? (
                    resumes.map((resume: any) => (
                      <SelectItem key={resume._id} value={resume._id}>
                        {resume.title}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>No resumes available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cover-letter">Cover Letter (Optional)</Label>
              <Textarea
                id="cover-letter"
                placeholder="Write your cover letter here..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddApplication}
                disabled={createApplication.isPending}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {createApplication.isPending ? 'Creating...' : 'Create Application'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
