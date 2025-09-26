'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { 
  useJobs, 
  useSearchJobs, 
  useJobRecommendations, 
  useApplyForJob 
} from '@/hooks/useApi';
import {
  Search,
  MapPin,
  DollarSign,
  Clock,
  Building,
  Users,
  Star,
  Bookmark,
  Filter,
  ArrowRight,
  Briefcase,
  Globe,
  Calendar,
  TrendingUp
} from 'lucide-react';

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [experience, setExperience] = useState('');
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [showRecommendations, setShowRecommendations] = useState(true);
  const { toast } = useToast();

  // API hooks
  const { data: allJobs = [], isLoading: jobsLoading } = useJobs();
  const { data: recommendations = [], isLoading: recommendationsLoading } = useJobRecommendations();
  const applyForJob = useApplyForJob();

  // Search jobs when filters change
  const searchParams = {
    keywords: searchQuery,
    location,
    experienceLevel: experience,
    employmentType: jobType,
  };

  const hasSearchParams = Object.values(searchParams).some(value => value);
  const { data: searchResults = [], isLoading: searchLoading } = useSearchJobs(
    searchParams, 
    hasSearchParams
  );

  const jobListings = hasSearchParams ? searchResults : (showRecommendations ? recommendations : allJobs);
  const isLoading = hasSearchParams ? searchLoading : (showRecommendations ? recommendationsLoading : jobsLoading);

  const handleApply = async (jobId: string) => {
    try {
      await applyForJob.mutateAsync({
        jobId,
        coverLetter: '', // You might want to add a cover letter modal
      });
    } catch (error) {
      console.error('Application failed:', error);
    }
  };

  const toggleSaveJob = (jobId: string) => {
    const newSavedJobs = new Set(savedJobs);
    if (savedJobs.has(jobId)) {
      newSavedJobs.delete(jobId);
      toast({
        title: "Job removed",
        description: "Job removed from saved list.",
      });
    } else {
      newSavedJobs.add(jobId);
      toast({
        title: "Job saved",
        description: "Job added to your saved list.",
      });
    }
    setSavedJobs(newSavedJobs);
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    return `Up to $${max?.toLocaleString()}`;
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Find Jobs</h1>
            <p className="text-gray-600 mt-1">Discover opportunities that match your skills and goals</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              <Bookmark className="h-4 w-4 mr-2" />
              Saved ({savedJobs.size})
            </Button>
          </div>
        </motion.div>

        {/* Search Section */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                  <Label htmlFor="search">Job Title or Keywords</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="e.g. Software Engineer, Designer..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="location"
                      placeholder="City, State"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label>Job Type</Label>
                  <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                  <Search className="h-4 w-4 mr-2" />
                  Search Jobs
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Summary */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {jobListings.length} Jobs Found
            </h2>
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <TrendingUp className="h-4 w-4" />
              <span>Sorted by relevance</span>
            </div>
          </div>
          <Select value="relevance">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="date">Date Posted</SelectItem>
              <SelectItem value="salary">Salary</SelectItem>
              <SelectItem value="company">Company</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Job Listings */}
        <motion.div variants={itemVariants} className="space-y-4">
          {jobListings.map((job, index) => (
            <motion.div
              key={job.id}
              variants={itemVariants}
              whileHover={{ y: -2 }}
              className="group"
            >
              <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center text-2xl border border-gray-200">
                            {job.logo}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {job.title}
                              </h3>
                              <div className="flex items-center space-x-4 mt-1">
                                <div className="flex items-center text-gray-600">
                                  <Building className="h-4 w-4 mr-1" />
                                  <span className="font-medium">{job.company}</span>
                                </div>
                                <div className="flex items-center text-gray-500">
                                  <Star className="h-4 w-4 mr-1 text-yellow-400" />
                                  <span>{job.rating}</span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleSaveJob(job.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                savedJobs.has(job.id)
                                  ? 'text-blue-600 bg-blue-50'
                                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              <Bookmark className={`h-5 w-5 ${savedJobs.has(job.id) ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {job.location}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {job.type}
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {job.salary}
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {job.experience}
                            </div>
                            {job.remote && (
                              <div className="flex items-center text-green-600">
                                <Globe className="h-4 w-4 mr-1" />
                                Remote
                              </div>
                            )}
                          </div>
                          
                          <p className="text-gray-700 mt-3 text-sm line-clamp-2">
                            {job.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mt-3">
                            {job.skills.slice(0, 4).map((skill, skillIndex) => (
                              <span
                                key={skillIndex}
                                className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-md border border-blue-200"
                              >
                                {skill}
                              </span>
                            ))}
                            {job.skills.length > 4 && (
                              <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md">
                                +{job.skills.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col lg:items-end space-y-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {job.posted}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                          Apply Now
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Load More */}
        <motion.div variants={itemVariants} className="text-center">
          <Button variant="outline" size="lg">
            Load More Jobs
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            Showing 6 of 248 results
          </p>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
