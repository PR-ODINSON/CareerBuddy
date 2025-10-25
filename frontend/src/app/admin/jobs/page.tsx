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
  Briefcase,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MapPin,
  DollarSign,
  Calendar,
  Building,
  Users,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  BookOpen,
  Star
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface Job {
  _id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  location: string;
  locationType: 'REMOTE' | 'ONSITE' | 'HYBRID';
  salaryMin: number;
  salaryMax: number;
  experienceLevel: 'ENTRY' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';
  skills: string[];
  benefits: string[];
  department?: string;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface JobFormData {
  title: string;
  company: string;
  description: string;
  requirements: string[];
  location: string;
  locationType: 'REMOTE' | 'ONSITE' | 'HYBRID';
  salaryMin: number;
  salaryMax: number;
  experienceLevel: 'ENTRY' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';
  skills: string[];
  benefits: string[];
  department: string;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
}

export default function AdminJobsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isApplicationsDialogOpen, setIsApplicationsDialogOpen] = useState(false);
  const [selectedJobApplications, setSelectedJobApplications] = useState<any[]>([]);
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    company: '',
    description: '',
    requirements: [],
    location: '',
    locationType: 'ONSITE',
    salaryMin: 0,
    salaryMax: 0,
    experienceLevel: 'ENTRY',
    skills: [],
    benefits: [],
    department: '',
    employmentType: 'FULL_TIME'
  });

  useEffect(() => {
    if (authLoading) {
      return;
    }
    
    if (!user || user.role !== 'ADMIN') {
      router.push('/auth/login');
      return;
    }
    
    fetchJobs();
    fetchAnalytics();
  }, [user, authLoading, router, currentPage, locationFilter, statusFilter, experienceFilter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });
      
      if (locationFilter !== 'all') {
        params.append('locationType', locationFilter.toUpperCase());
      }
      if (experienceFilter !== 'all') {
        params.append('experienceLevel', experienceFilter.toUpperCase());
      }
      if (statusFilter !== 'all') {
        params.append('isActive', statusFilter === 'active' ? 'true' : 'false');
      }

      const data = await apiClient.get(`/jobs?${params}`);
      
      // If no jobs found and we have filters, try without filters
      if ((!data.jobs || data.jobs.length === 0) && params.toString() !== 'page=1&limit=20') {
        const fallbackData = await apiClient.get('/jobs?page=1&limit=20');
        setJobs(fallbackData.jobs || []);
        setTotalPages(fallbackData.pagination?.pages || 1);
      } else {
        setJobs(data.jobs || []);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load jobs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const data = await apiClient.get('/admin/analytics/jobs');
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const handleJobAction = async (jobId: string, action: 'activate' | 'deactivate') => {
    try {
      await apiClient.put(`/jobs/${jobId}`, { 
        isActive: action === 'activate' 
      });
      
      toast({
        title: 'Success',
        description: `Job ${action}d successfully`,
      });
      
      fetchJobs();
      fetchAnalytics();
    } catch (error) {
      console.error(`Failed to ${action} job:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${action} job`,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      await apiClient.delete(`/jobs/${jobId}`);
      
      toast({
        title: 'Success',
        description: 'Job deleted successfully',
      });
      
      fetchJobs();
      fetchAnalytics();
    } catch (error) {
      console.error('Failed to delete job:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete job',
        variant: 'destructive',
      });
    }
  };

  const handleViewApplications = async (jobId: string) => {
    try {
      const applications = await apiClient.get(`/applications/by-job/${jobId}`);
      setSelectedJobApplications(applications || []);
      setIsApplicationsDialogOpen(true);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load applications',
        variant: 'destructive',
      });
    }
  };

  const testDatabaseConnection = async () => {
    try {
      const data = await apiClient.get('/admin/test-db');
      console.log('Database test result:', data);
      toast({
        title: 'Database Test',
        description: `${data.message}. Jobs: ${data.counts?.jobs || 0}`,
      });
    } catch (error) {
      console.error('Database test failed:', error);
      toast({
        title: 'Database Test Failed',
        description: 'Could not connect to database',
        variant: 'destructive',
      });
    }
  };

  const forceRefreshAllJobs = async () => {
    try {
      setLoading(true);
      console.log('Force refreshing all jobs...');
      const data = await apiClient.get('/jobs?page=1&limit=50'); // Get more jobs
      console.log('Force refresh response:', data);
      setJobs(data.jobs || []);
      setTotalPages(data.pagination?.pages || 1);
      toast({
        title: 'Jobs Refreshed',
        description: `Loaded ${data.jobs?.length || 0} jobs`,
      });
    } catch (error) {
      console.error('Force refresh failed:', error);
      toast({
        title: 'Refresh Failed',
        description: 'Could not refresh jobs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };


  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setFormData({
      title: job.title,
      company: job.company,
      description: job.description,
      requirements: job.requirements,
      location: job.location,
      locationType: job.locationType,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      experienceLevel: job.experienceLevel,
      skills: job.skills,
      benefits: job.benefits,
      department: job.department || '',
      employmentType: job.employmentType
    });
    setIsEditDialogOpen(true);
  };

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setIsViewDialogOpen(true);
  };

  const handleCreateJob = () => {
    setFormData({
      title: '',
      company: '',
      description: '',
      requirements: [],
      location: '',
      locationType: 'ONSITE',
      salaryMin: 0,
      salaryMax: 0,
      experienceLevel: 'ENTRY',
      skills: [],
      benefits: [],
      department: '',
      employmentType: 'FULL_TIME'
    });
    setIsCreateDialogOpen(true);
  };

  const handleSubmit = async (isEdit: boolean) => {
    try {
      if (isEdit && selectedJob) {
        await apiClient.put(`/jobs/${selectedJob._id}`, formData);
        toast({
          title: 'Success',
          description: 'Job updated successfully',
        });
        setIsEditDialogOpen(false);
      } else {
        await apiClient.post('/jobs', formData);
        toast({
          title: 'Success',
          description: 'Job created successfully',
        });
        setIsCreateDialogOpen(false);
      }
      fetchJobs();
    } catch (error) {
      console.error('Failed to save job:', error);
      toast({
        title: 'Error',
        description: 'Failed to save job',
        variant: 'destructive',
      });
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && job.isActive) ||
                         (statusFilter === 'inactive' && !job.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case 'REMOTE':
        return 'bg-green-100 text-green-800';
      case 'HYBRID':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getExperienceLevelColor = (level: string) => {
    switch (level) {
      case 'ENTRY':
        return 'bg-green-100 text-green-800';
      case 'JUNIOR':
        return 'bg-blue-100 text-blue-800';
      case 'MID':
        return 'bg-yellow-100 text-yellow-800';
      case 'SENIOR':
        return 'bg-orange-100 text-orange-800';
      case 'LEAD':
        return 'bg-purple-100 text-purple-800';
      case 'EXECUTIVE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
                  <Briefcase className="h-8 w-8 text-blue-600 mr-3" />
                  Job Management
                </h1>
                <p className="text-gray-600 mt-1">Manage job postings and opportunities</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleCreateJob} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create New Job
              </Button>
              <Button variant="outline" onClick={testDatabaseConnection}>
                <Building className="h-4 w-4 mr-2" />
                Test Database
              </Button>
              <Button variant="outline" onClick={forceRefreshAllJobs}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Refresh Jobs
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics?.totalJobs || 0}</p>
                  <p className="text-xs text-gray-500">Showing {jobs.length} on page</p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                  <p className="text-2xl font-bold text-green-600">{analytics?.activeJobs || 0}</p>
                  <p className="text-xs text-gray-500">
                    {jobs.filter(job => job.isActive).length} active on page
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inactive Jobs</p>
                  <p className="text-2xl font-bold text-red-600">{analytics?.inactiveJobs || 0}</p>
                  <p className="text-xs text-gray-500">
                    {jobs.filter(job => !job.isActive).length} inactive on page
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recent Jobs</p>
                  <p className="text-2xl font-bold text-orange-600">{analytics?.recentJobs || 0}</p>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search jobs by title, company, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="onsite">On-site</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="entry">Entry</SelectItem>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="mid">Mid</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Action Guide */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2 mb-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">Job Management Actions</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span><strong>View:</strong> See full job details</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span><strong>Applications:</strong> View job applications</span>
              </div>
              <div className="flex items-center space-x-2">
                <Edit className="h-4 w-4" />
                <span><strong>Edit:</strong> Modify job information</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span><strong>Activate:</strong> Make job visible to users</span>
              </div>
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4" />
                <span><strong>Deactivate:</strong> Hide job from users</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trash2 className="h-4 w-4" />
                <span><strong>Delete:</strong> Permanently remove job</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600 mb-4">
                {jobs.length === 0 
                  ? "No jobs are currently available in the database." 
                  : `${jobs.length} jobs available, but none match your current filters.`
                }
              </p>
              <div className="space-x-2">
                <Button onClick={forceRefreshAllJobs} variant="outline">
                  Refresh Jobs
                </Button>
                {jobs.length > 0 && (
                  <Button onClick={() => {
                    setLocationFilter('all');
                    setStatusFilter('all');
                    setExperienceFilter('all');
                    setSearchTerm('');
                  }} variant="outline">
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          ) : (
            filteredJobs.map((job) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                      <Badge variant={job.isActive ? 'default' : 'secondary'}>
                        {job.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        {job.company}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        ₹{job.salaryMin.toLocaleString('en-IN')} - ₹{job.salaryMax.toLocaleString('en-IN')}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge className={getLocationTypeColor(job.locationType)}>
                        {job.locationType}
                      </Badge>
                      <Badge className={getExperienceLevelColor(job.experienceLevel)}>
                        {job.experienceLevel}
                      </Badge>
                      <Badge variant="outline">
                        {job.employmentType.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2">{job.description}</p>
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    {/* Primary Actions */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewJob(job)}
                        className="flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="text-xs">View</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewApplications(job._id)}
                        className="flex items-center space-x-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Users className="h-4 w-4" />
                        <span className="text-xs">Applications</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditJob(job)}
                        className="flex items-center space-x-1 text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="text-xs">Edit</span>
                      </Button>
                    </div>
                    
                    {/* Status & Delete Actions */}
                    <div className="flex items-center space-x-2">
                      {job.isActive ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleJobAction(job._id, 'deactivate')}
                          className="flex items-center space-x-1 text-orange-600 border-orange-200 hover:bg-orange-50"
                        >
                          <XCircle className="h-4 w-4" />
                          <span className="text-xs">Deactivate</span>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleJobAction(job._id, 'activate')}
                          className="flex items-center space-x-1 text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-xs">Activate</span>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteJob(job._id)}
                        className="flex items-center space-x-1 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="text-xs">Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Skills */}
                {job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {job.skills.slice(0, 6).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {job.skills.length > 6 && (
                      <Badge variant="secondary" className="text-xs">
                        +{job.skills.length - 6} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
            ))
          )}
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

      {/* View Job Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedJob?.title}</DialogTitle>
            <DialogDescription>{selectedJob?.company}</DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Location</Label>
                  <p className="text-sm text-gray-600">{selectedJob.location}</p>
                </div>
                <div>
                  <Label>Location Type</Label>
                  <Badge className={getLocationTypeColor(selectedJob.locationType)}>
                    {selectedJob.locationType}
                  </Badge>
                </div>
                <div>
                  <Label>Salary Range</Label>
                  <p className="text-sm text-gray-600">
                    ${selectedJob.salaryMin.toLocaleString()} - ${selectedJob.salaryMax.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label>Experience Level</Label>
                  <Badge className={getExperienceLevelColor(selectedJob.experienceLevel)}>
                    {selectedJob.experienceLevel}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label>Description</Label>
                <p className="text-sm text-gray-600 mt-1">{selectedJob.description}</p>
              </div>
              
              <div>
                <Label>Requirements</Label>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                  {selectedJob.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedJob.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Benefits</Label>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                  {selectedJob.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Job Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditDialogOpen ? 'Edit Job' : 'Create New Job'}</DialogTitle>
            <DialogDescription>
              {isEditDialogOpen ? 'Update job information' : 'Add a new job posting'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="locationType">Location Type</Label>
              <Select value={formData.locationType} onValueChange={(value: any) => setFormData({...formData, locationType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REMOTE">Remote</SelectItem>
                  <SelectItem value="ONSITE">On-site</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="salaryMin">Minimum Salary</Label>
              <Input
                id="salaryMin"
                type="number"
                value={formData.salaryMin}
                onChange={(e) => setFormData({...formData, salaryMin: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="salaryMax">Maximum Salary</Label>
              <Input
                id="salaryMax"
                type="number"
                value={formData.salaryMax}
                onChange={(e) => setFormData({...formData, salaryMax: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="experienceLevel">Experience Level</Label>
              <Select value={formData.experienceLevel} onValueChange={(value: any) => setFormData({...formData, experienceLevel: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENTRY">Entry</SelectItem>
                  <SelectItem value="JUNIOR">Junior</SelectItem>
                  <SelectItem value="MID">Mid</SelectItem>
                  <SelectItem value="SENIOR">Senior</SelectItem>
                  <SelectItem value="LEAD">Lead</SelectItem>
                  <SelectItem value="EXECUTIVE">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="employmentType">Employment Type</Label>
              <Select value={formData.employmentType} onValueChange={(value: any) => setFormData({...formData, employmentType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL_TIME">Full Time</SelectItem>
                  <SelectItem value="PART_TIME">Part Time</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                  <SelectItem value="INTERNSHIP">Internship</SelectItem>
                  <SelectItem value="FREELANCE">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="requirements">Requirements (comma-separated)</Label>
              <Textarea
                id="requirements"
                value={formData.requirements.join(', ')}
                onChange={(e) => setFormData({...formData, requirements: e.target.value.split(', ').filter(Boolean)})}
                rows={3}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Textarea
                id="skills"
                value={formData.skills.join(', ')}
                onChange={(e) => setFormData({...formData, skills: e.target.value.split(', ').filter(Boolean)})}
                rows={2}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="benefits">Benefits (comma-separated)</Label>
              <Textarea
                id="benefits"
                value={formData.benefits.join(', ')}
                onChange={(e) => setFormData({...formData, benefits: e.target.value.split(', ').filter(Boolean)})}
                rows={2}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button onClick={() => handleSubmit(isEditDialogOpen)}>
              {isEditDialogOpen ? 'Save Changes' : 'Create Job'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Applications Dialog */}
      <Dialog open={isApplicationsDialogOpen} onOpenChange={setIsApplicationsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Job Applications</DialogTitle>
            <DialogDescription>
              View all applications for this job position
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedJobApplications.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No Applications Yet</h3>
                <p className="text-gray-600 mb-4">This job position hasn't received any applications so far.</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Make sure the job is active and visible to attract more applicants.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>{selectedJobApplications.length}</strong> application{selectedJobApplications.length !== 1 ? 's' : ''} found for this position
                  </p>
                </div>
                {selectedJobApplications.map((application, index) => (
                  <div key={application._id || index} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg text-gray-900">
                              {application.applicant?.firstName} {application.applicant?.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">{application.applicant?.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 mb-3">
                          <Badge variant={
                            application.status === 'PENDING' ? 'secondary' :
                            application.status === 'ACCEPTED' ? 'default' :
                            application.status === 'REJECTED' ? 'destructive' : 'outline'
                          }>
                            {application.status}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Applied on {new Date(application.appliedAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Applicant Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {application.applicant?.university && (
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            <strong>University:</strong> {application.applicant.university}
                          </span>
                        </div>
                      )}
                      {application.applicant?.major && (
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            <strong>Major:</strong> {application.applicant.major}
                          </span>
                        </div>
                      )}
                      {application.applicant?.graduationYear && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            <strong>Graduation:</strong> {application.applicant.graduationYear}
                          </span>
                        </div>
                      )}
                      {application.applicant?.gpa && (
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            <strong>GPA:</strong> {application.applicant.gpa}/4.0
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {application.coverLetter && (
                      <div className="mb-4">
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">Cover Letter:</h5>
                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {application.coverLetter}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Resume Information */}
                    {application.resumeId && (
                      <div className="mb-4">
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">Resume:</h5>
                        <div className="flex items-center space-x-2 text-sm text-blue-600">
                          <BookOpen className="h-4 w-4" />
                          <span>{application.resumeId.title || application.resumeId.fileName}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                      {application.status === 'PENDING' && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View Profile
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={() => setIsApplicationsDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
