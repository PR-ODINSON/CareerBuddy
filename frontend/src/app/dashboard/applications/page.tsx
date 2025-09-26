'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { 
  useApplications, 
  useApplicationStats, 
  useUpcomingInterviews, 
  useUpdateApplication, 
  useWithdrawApplication 
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

  const applications = [
    {
      id: 1,
      jobTitle: 'Frontend Developer',
      company: 'TechCorp Inc.',
      companyLogo: '🚀',
      location: 'San Francisco, CA',
      salary: '$80,000 - $120,000',
      appliedDate: '2024-01-15',
      status: 'interview',
      stage: 'Technical Interview',
      nextStep: 'Final round scheduled',
      nextDate: '2024-01-25',
      resumeUsed: 'Frontend Developer Resume v2.1',
      notes: 'Great team culture, flexible working hours'
    },
    {
      id: 2,
      jobTitle: 'Software Engineer',
      company: 'StartupXYZ',
      companyLogo: '💡',
      location: 'Austin, TX',
      salary: '$90,000 - $130,000',
      appliedDate: '2024-01-10',
      status: 'applied',
      stage: 'Application Submitted',
      nextStep: 'Waiting for response',
      nextDate: null,
      resumeUsed: 'Software Engineer Resume v1.3',
      notes: 'Innovative fintech startup, remote-friendly'
    },
    {
      id: 3,
      jobTitle: 'UI/UX Designer',
      company: 'DesignHub',
      companyLogo: '🎨',
      location: 'New York, NY',
      salary: '$70,000 - $90,000',
      appliedDate: '2024-01-08',
      status: 'rejected',
      stage: 'Application Review',
      nextStep: 'Application closed',
      nextDate: null,
      resumeUsed: 'Design Resume v1.0',
      notes: 'Portfolio review feedback: Focus more on user research'
    },
    {
      id: 4,
      jobTitle: 'Full Stack Developer',
      company: 'WebSolutions',
      companyLogo: '🌐',
      location: 'Seattle, WA',
      salary: '$85,000 - $110,000',
      appliedDate: '2024-01-05',
      status: 'offer',
      stage: 'Offer Received',
      nextStep: 'Negotiating terms',
      nextDate: '2024-01-20',
      resumeUsed: 'Full Stack Resume v1.5',
      notes: 'Great benefits package, 4-day work week'
    },
    {
      id: 5,
      jobTitle: 'Data Analyst Intern',
      company: 'DataCorp',
      companyLogo: '📊',
      location: 'Boston, MA',
      salary: '$25 - $30/hour',
      appliedDate: '2024-01-03',
      status: 'interview',
      stage: 'Phone Screen',
      nextStep: 'Technical assessment',
      nextDate: '2024-01-22',
      resumeUsed: 'Internship Resume v1.0',
      notes: 'Summer internship program, good learning opportunities'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'interview':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'offer':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied':
        return <Clock className="h-4 w-4" />;
      case 'interview':
        return <AlertCircle className="h-4 w-4" />;
      case 'offer':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const statusCounts = {
    applied: applications.filter(app => app.status === 'applied').length,
    interview: applications.filter(app => app.status === 'interview').length,
    offer: applications.filter(app => app.status === 'offer').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
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
                    <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{statusCounts.applied + statusCounts.interview}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{statusCounts.interview}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{statusCounts.offer}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Applications List */}
        <motion.div variants={itemVariants} className="space-y-4">
          {filteredApplications.map((application, index) => (
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
                            {application.companyLogo}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {application.jobTitle}
                              </h3>
                              <div className="flex items-center space-x-4 mt-1">
                                <div className="flex items-center text-gray-600">
                                  <Building className="h-4 w-4 mr-1" />
                                  <span className="font-medium">{application.company}</span>
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
                              {application.location}
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {application.salary}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Applied {new Date(application.appliedDate).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <div className="flex items-center text-sm">
                              <span className="font-medium text-gray-700">Current Stage:</span>
                              <span className="ml-2 text-gray-600">{application.stage}</span>
                            </div>
                            <div className="flex items-center text-sm mt-1">
                              <span className="font-medium text-gray-700">Next Step:</span>
                              <span className="ml-2 text-gray-600">{application.nextStep}</span>
                              {application.nextDate && (
                                <span className="ml-2 text-blue-600">
                                  ({new Date(application.nextDate).toLocaleDateString()})
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {application.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <FileText className="h-4 w-4 inline mr-1" />
                                {application.notes}
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
                        Resume: {application.resumeUsed}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
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
    </DashboardLayout>
  );
}
