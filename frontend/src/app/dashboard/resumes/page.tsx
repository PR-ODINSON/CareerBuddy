'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { 
  useResumes, 
  useUploadResume, 
  useAnalyzeResume, 
  useSetActiveResume, 
  useDeleteResume 
} from '@/hooks/useApi';
import {
  Upload,
  FileText,
  Download,
  Edit,
  Trash2,
  Eye,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Share2,
  Copy,
  Award
} from 'lucide-react';

export default function ResumesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [resumeName, setResumeName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // API hooks
  const { data: resumes = [], isLoading, refetch } = useResumes();
  const uploadResume = useUploadResume();
  const analyzeResume = useAnalyzeResume();
  const setActiveResume = useSetActiveResume();
  const deleteResume = useDeleteResume();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOC, DOCX, or TXT file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      await uploadResume.mutateAsync(file);
      setUploadModalOpen(false);
      setResumeName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleAnalyze = async (resumeId: string) => {
    try {
      await analyzeResume.mutateAsync(resumeId);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const handleSetActive = async (resumeId: string) => {
    try {
      await setActiveResume.mutateAsync(resumeId);
    } catch (error) {
      console.error('Set active failed:', error);
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await deleteResume.mutateAsync(resumeId);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const filteredResumes = resumes.filter((resume: any) =>
    resume.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resume.originalFileName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.ceil(diffDays / 30)} month${Math.ceil(diffDays / 30) > 1 ? 's' : ''} ago`;
  };

  const getResumeScore = (resume: any) => {
    if (resume.analysisResults?.overall_score) {
      return Math.round(resume.analysisResults.overall_score);
    }
    return resume.isActive ? 85 : Math.floor(Math.random() * 40) + 60; // Fallback
  };

  const getResumeStatus = (resume: any) => {
    if (!resume.analysisResults) return 'pending';
    const score = resume.analysisResults.overall_score || 0;
    if (score >= 85) return 'optimized';
    if (score >= 70) return 'needs_review';
    return 'draft';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimized':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'needs_review':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'draft':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimized':
        return <CheckCircle className="h-4 w-4" />;
      case 'needs_review':
        return <AlertCircle className="h-4 w-4" />;
      case 'draft':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900">My Resumes</h1>
            <p className="text-gray-600 mt-1">Manage and optimize your resumes with AI-powered insights</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button 
              onClick={() => setUploadModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Resume
            </Button>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div variants={itemVariants}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search resumes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Resumes</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {isLoading ? '...' : resumes.length}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Score</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {isLoading ? '...' : resumes.length > 0 ? 
                        Math.round(resumes.reduce((acc: number, resume: any) => acc + getResumeScore(resume), 0) / resumes.length) : 
                        'N/A'
                      }
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Resume</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {isLoading ? '...' : resumes.filter((r: any) => r.isActive).length > 0 ? '✓' : '-'}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Latest Version</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {isLoading ? '...' : resumes.length > 0 ? 
                        Math.max(...resumes.map((r: any) => r.version || 1)) : 
                        'N/A'
                      }
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Resume List */}
        <motion.div variants={itemVariants} className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading resumes...</p>
            </div>
          ) : filteredResumes.length === 0 ? (
            <Card className="py-12">
              <CardContent className="text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No resumes found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery ? 'No resumes match your search.' : 'Get started by uploading your first resume.'}
                </p>
                <Button 
                  onClick={() => setUploadModalOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Resume
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredResumes.map((resume: any, index: number) => (
              <motion.div
                key={resume._id}
                variants={itemVariants}
                whileHover={{ y: -2 }}
                className="group"
              >
                <Card className={`hover:shadow-lg transition-all duration-300 ${resume.isActive ? 'ring-2 ring-blue-200' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className={`w-12 h-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center border ${resume.isActive ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}>
                              <FileText className={`h-6 w-6 ${resume.isActive ? 'text-blue-700' : 'text-blue-600'}`} />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {resume.title || 'Untitled Resume'}
                                  </h3>
                                  {resume.isActive && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      Active
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{resume.originalFileName}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(getResumeStatus(resume))}`}>
                                  {getStatusIcon(getResumeStatus(resume))}
                                  <span className="ml-1 capitalize">{getResumeStatus(resume).replace('_', ' ')}</span>
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {formatDate(resume.updatedAt)}
                              </div>
                              <div className="flex items-center">
                                <Star className="h-4 w-4 mr-1 text-yellow-500" />
                                Score: {getResumeScore(resume)}%
                              </div>
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-1" />
                                Version {resume.version || 1}
                              </div>
                              {resume.analysisResults && (
                                <div className="flex items-center">
                                  <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                                  Analyzed
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                              <span>Uploaded {formatDate(resume.createdAt)}</span>
                              {resume.fileSize && (
                                <>
                                  <span>•</span>
                                  <span>{(resume.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col lg:items-end space-y-3">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAnalyze(resume._id)}
                            disabled={analyzeResume.isPending}
                          >
                            <Search className="h-4 w-4 mr-1" />
                            {analyzeResume.isPending ? 'Analyzing...' : 'Analyze'}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSetActive(resume._id)}
                            disabled={setActiveResume.isPending || resume.isActive}
                          >
                            <Star className="h-4 w-4 mr-1" />
                            {resume.isActive ? 'Active' : 'Set Active'}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(resume._id)}
                            disabled={deleteResume.isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Upload Modal/Card */}
        {uploadModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setUploadModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Resume</h3>
                <p className="text-gray-600">Upload your resume and get AI-powered optimization suggestions</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="resume-name">Resume Name</Label>
                  <Input
                    id="resume-name"
                    placeholder="e.g., Software Engineer Resume"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Upload File</Label>
                  <div 
                    className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, TXT up to 5MB</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setUploadModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    disabled={uploadResume.isPending}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadResume.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      'Upload'
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Quick Tips */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">💡 Resume Optimization Tips</h3>
                  <ul className="text-gray-700 space-y-1 text-sm">
                    <li>• Use action verbs to describe your accomplishments</li>
                    <li>• Quantify your achievements with numbers and percentages</li>
                    <li>• Tailor your resume keywords to match job descriptions</li>
                    <li>• Keep your resume to 1-2 pages for optimal readability</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
