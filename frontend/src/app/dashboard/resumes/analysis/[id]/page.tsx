'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useResumeAnalysis, useResumeBasedJobRecommendations, useAnalyzeResume } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  Lightbulb,
  Target,
  Award,
  FileText,
  Brain,
  Briefcase,
  TrendingUp,
  Users,
  Clock,
  Star,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResumeAnalysisResult {
  ats_score: number;
  detailed_scores: {
    formatting: number;
    content_quality: number;
    keyword_optimization: number;
    section_completeness: number;
    readability: number;
  };
  feedback: {
    strengths: string[];
    improvements: string[];
    suggestions: string[];
    critical_issues: string[];
  };
  skills: string[];
  experience_years: number;
  sections: {
    contact: boolean;
    summary: boolean;
    experience: boolean;
    education: boolean;
    skills: boolean;
    projects: boolean;
    certifications: boolean;
  };
  content_analysis: {
    word_count: number;
    has_quantified_achievements: boolean;
    action_verbs_count: number;
    grammar_issues: string[];
    formatting_issues: string[];
  };
  ats_compatibility: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
}

interface JobRecommendation {
  id: string;
  title: string;
  company: string;
  location: string;
  match_score: number;
  matching_skills: string[];
  salary_range?: string;
  experience_level: string;
  job_type: string;
}

export default function ResumeAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [jobRecommendations, setJobRecommendations] = useState<JobRecommendation[]>([]);

  // Use hooks for data fetching
  const { data: analysisData, isLoading, error, refetch } = useResumeAnalysis(params.id as string);
  const getJobRecommendations = useResumeBasedJobRecommendations();
  const analyzeResume = useAnalyzeResume();

  const analysis = analysisData?.analysis;
  const resumeTitle = analysisData?.resume?.title || '';

  useEffect(() => {
    // Fetch job recommendations when analysis data is available
    if (analysis) {
      fetchJobRecommendations(analysis);
    }
  }, [analysis]);

  const fetchJobRecommendations = async (analysisData: ResumeAnalysisResult) => {
    try {
      const recommendations = await getJobRecommendations.mutateAsync({
        skills: analysisData.skills,
        experience_years: analysisData.experience_years,
        ats_score: analysisData.ats_score
      });
      setJobRecommendations(recommendations);
    } catch (error) {
      console.error('Error fetching job recommendations:', error);
    }
  };

  const handleReanalyze = async () => {
    try {
      await analyzeResume.mutateAsync(params.id as string);
      // Refetch the analysis data
      refetch();
      toast({
        title: "Success",
        description: "Resume re-analyzed successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to re-analyze resume",
        variant: "destructive"
      });
    }
  };

  const handleExportReport = () => {
    if (!analysis) return;

    // Create a comprehensive report
    const reportContent = `
RESUME ANALYSIS REPORT
=====================

Resume: ${resumeTitle}
Analysis Date: ${new Date().toLocaleDateString('en-IN')}

OVERALL SCORE: ${analysis.ats_score}%

DETAILED SCORES:
${Object.entries(analysis.detailed_scores).map(([key, score]) => 
  `• ${key.replace(/_/g, ' ').toUpperCase()}: ${score}%`
).join('\n')}

STRENGTHS:
${analysis.feedback.strengths.map((strength: string) => `• ${strength}`).join('\n')}

AREAS FOR IMPROVEMENT:
${analysis.feedback.improvements.map((improvement: string) => `• ${improvement}`).join('\n')}

OPTIMIZATION SUGGESTIONS:
${analysis.feedback.suggestions.map((suggestion: string) => `• ${suggestion}`).join('\n')}

${analysis.feedback.critical_issues.length > 0 ? `
CRITICAL ISSUES (MUST FIX):
${analysis.feedback.critical_issues.map((issue: string) => `• ${issue}`).join('\n')}
` : ''}

SKILLS DETECTED (${analysis.skills.length}):
${analysis.skills.join(', ')}

CONTENT METRICS:
• Word Count: ${analysis.content_analysis.word_count}
• Experience: ${analysis.experience_years} years
• Action Verbs: ${analysis.content_analysis.action_verbs_count}
• Quantified Achievements: ${analysis.content_analysis.has_quantified_achievements ? 'Yes' : 'No'}

ATS COMPATIBILITY: ${analysis.ats_score}%
${analysis.ats_compatibility.issues.length > 0 ? `
ATS Issues:
${analysis.ats_compatibility.issues.map((issue: string) => `• ${issue}`).join('\n')}
` : ''}

Generated by CareerBuddy - Your AI-Powered Career Assistant
    `.trim();

    // Create and download the file
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resumeTitle.replace(/[^a-z0-9]/gi, '_')}_Analysis_Report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Exported",
      description: "Analysis report has been downloaded successfully"
    });
  };

  const handleShare = async () => {
    if (!analysis) return;

    const shareData = {
      title: `${resumeTitle} - Resume Analysis Report`,
      text: `My resume scored ${analysis.ats_score}% on ATS compatibility! Check out my detailed analysis report.`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "Shared Successfully",
          description: "Analysis report shared successfully"
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        toast({
          title: "Link Copied",
          description: "Analysis report link copied to clipboard"
        });
      }
    } catch (error) {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Analysis report link copied to clipboard"
        });
      } catch (clipboardError) {
        toast({
          title: "Share Failed",
          description: "Unable to share or copy link",
          variant: "destructive"
        });
      }
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 85) return <CheckCircle className="h-5 w-5" />;
    if (score >= 70) return <AlertCircle className="h-5 w-5" />;
    return <XCircle className="h-5 w-5" />;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Loading analysis...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !analysis) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Analysis Found</h2>
          <p className="text-gray-600 mb-6">
            {error ? 'Failed to load analysis data.' : 'This resume hasn\'t been analyzed yet.'}
          </p>
          <div className="space-x-4">
            <Button onClick={() => router.push('/dashboard/resumes')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Resumes
            </Button>
            {!error && (
              <Button onClick={handleReanalyze} disabled={analyzeResume.isPending}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {analyzeResume.isPending ? 'Analyzing...' : 'Analyze Resume'}
              </Button>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard/resumes')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Resumes
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{resumeTitle} - Analysis Report</h1>
              <p className="text-gray-600">Comprehensive resume analysis and recommendations</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={handleReanalyze}
              disabled={analyzeResume.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${analyzeResume.isPending ? 'animate-spin' : ''}`} />
              {analyzeResume.isPending ? 'Re-analyzing...' : 'Re-analyze'}
            </Button>
            <Button variant="outline" onClick={handleExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Overall Score Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className={`p-4 rounded-full border-2 ${getScoreColor(analysis.ats_score)}`}>
                {getScoreIcon(analysis.ats_score)}
              </div>
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">
                  {analysis.ats_score}%
                </h2>
                <p className="text-xl text-gray-700">Overall ATS Score</p>
                <p className="text-gray-600 mt-2">
                  {analysis.ats_score >= 85 
                    ? "Excellent! Your resume is well-optimized for ATS systems."
                    : analysis.ats_score >= 70
                    ? "Good foundation with room for improvement."
                    : "Needs significant optimization for ATS compatibility."
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-2">Analysis Date</div>
              <div className="text-lg font-semibold">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </motion.div>

        {/* Detailed Scores Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                Detailed Score Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {Object.entries(analysis.detailed_scores).map(([key, score]) => (
                  <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className={`text-3xl font-bold mb-2 ${getScoreColor(score as number).split(' ')[0]}`}>
                      {score as number}%
                    </div>
                    <div className="text-sm text-gray-600 capitalize mb-3">
                      {key.replace(/_/g, ' ')}
                    </div>
                    <Progress value={score as number} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Analysis Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Critical Issues */}
            {analysis.feedback.critical_issues.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="flex items-center text-red-700">
                      <XCircle className="h-5 w-5 mr-2" />
                      Critical Issues (Must Fix)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {analysis.feedback.critical_issues.map((issue: string, index: number) => (
                        <li key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                          <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-red-700">{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Feedback Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              {analysis.feedback.strengths.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="flex items-center text-green-700">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.feedback.strengths.map((strength: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-green-700 text-sm">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Improvements */}
              {analysis.feedback.improvements.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader>
                      <CardTitle className="flex items-center text-yellow-700">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        Improvements Needed
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.feedback.improvements.map((improvement: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <span className="text-yellow-700 text-sm">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Suggestions */}
            {analysis.feedback.suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-700">
                      <Lightbulb className="h-5 w-5 mr-2" />
                      Optimization Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.feedback.suggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-blue-700 text-sm">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Job Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-purple-500" />
                    Recommended Jobs Based on Your Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {jobRecommendations.length > 0 ? (
                    <div className="space-y-4">
                      {jobRecommendations.map((job, index) => (
                        <div key={job.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">{job.title}</h3>
                              <p className="text-gray-600">{job.company} • {job.location}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant="secondary" className="mb-1">
                                {job.match_score}% Match
                              </Badge>
                              {job.salary_range && (
                                <p className="text-sm text-gray-600">{job.salary_range}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {job.matching_skills.slice(0, 5).map((skill: string, skillIndex: number) => (
                              <Badge key={skillIndex} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {job.matching_skills.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{job.matching_skills.length - 5} more
                              </Badge>
                            )}
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex space-x-4 text-sm text-gray-600">
                              <span>{job.experience_level}</span>
                              <span>{job.job_type}</span>
                            </div>
                            <Button size="sm" variant="outline">
                              View Job
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Relevant Jobs Found</h3>
                      <p className="text-gray-600 mb-4">
                        We couldn't find any jobs matching your current resume profile. 
                        Consider improving your ATS score or expanding your skill set.
                      </p>
                      <div className="space-y-2 text-sm text-gray-500">
                        <p>• Enhance your technical skills section</p>
                        <p>• Add more relevant keywords to your resume</p>
                        <p>• Consider additional certifications in your field</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Summary Cards */}
          <div className="space-y-6">
            {/* Section Completeness */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Section Completeness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analysis.sections).map(([section, present]) => (
                      <div key={section} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{section}</span>
                        {present ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-sm">
                    <Zap className="h-4 w-4 mr-2" />
                    Skills Detected ({analysis.skills.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skills.slice(0, 15).map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {analysis.skills.length > 15 && (
                      <Badge variant="outline" className="text-xs">
                        +{analysis.skills.length - 15} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Content Metrics */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-sm">
                    <Brain className="h-4 w-4 mr-2" />
                    Content Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Word Count:</span>
                      <span className="font-medium">{analysis.content_analysis.word_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experience:</span>
                      <span className="font-medium">{analysis.experience_years} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Action Verbs:</span>
                      <span className="font-medium">{analysis.content_analysis.action_verbs_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantified Achievements:</span>
                      <span className={`font-medium ${
                        analysis.content_analysis.has_quantified_achievements ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {analysis.content_analysis.has_quantified_achievements ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ATS Compatibility */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-sm">
                    <Target className="h-4 w-4 mr-2" />
                    ATS Compatibility
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Score</span>
                      <span className={`text-lg font-bold ${getScoreColor(analysis.ats_score).split(' ')[0]}`}>
                        {analysis.ats_score}%
                      </span>
                    </div>
                    <Progress value={analysis.ats_score} className="h-2" />
                    
                    {analysis.ats_compatibility.issues.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-red-700 mb-2">Issues to Address:</h4>
                        <ul className="space-y-1">
                          {analysis.ats_compatibility.issues.slice(0, 3).map((issue: string, index: number) => (
                            <li key={index} className="text-xs text-red-600 flex items-start">
                              <span className="mr-1">•</span>
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {analysis.ats_compatibility.recommendations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-blue-700 mb-2">Recommendations:</h4>
                        <ul className="space-y-1">
                          {analysis.ats_compatibility.recommendations.slice(0, 2).map((rec: string, index: number) => (
                            <li key={index} className="text-xs text-blue-600 flex items-start">
                              <span className="mr-1">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
