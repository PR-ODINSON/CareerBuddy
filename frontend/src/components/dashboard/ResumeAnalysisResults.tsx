'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  TrendingUp, 
  FileText, 
  Target, 
  Lightbulb,
  Award,
  BarChart3,
  Eye,
  Download,
  Share2,
  RefreshCw
} from 'lucide-react';

interface ResumeAnalysisResultsProps {
  analysis: {
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
  };
  onReanalyze?: () => void;
}

export default function ResumeAnalysisResults({ analysis, onReanalyze }: ResumeAnalysisResultsProps) {
  // Early return if analysis is completely missing
  if (!analysis) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">No analysis data available</div>
        <p className="text-sm text-gray-400 mt-2">Please upload and analyze a resume first.</p>
      </div>
    );
  }

  // Provide default values to prevent undefined errors
  const safeAnalysis = {
    ats_score: analysis?.ats_score || 0,
    detailed_scores: analysis?.detailed_scores || {
      formatting: 0,
      content_quality: 0,
      keyword_optimization: 0,
      section_completeness: 0,
      readability: 0
    },
    feedback: {
      strengths: analysis?.feedback?.strengths || [],
      improvements: analysis?.feedback?.improvements || [],
      suggestions: analysis?.feedback?.suggestions || [],
      critical_issues: analysis?.feedback?.critical_issues || []
    },
    skills: analysis?.skills || [],
    experience_years: analysis?.experience_years || 0,
    sections: {
      contact: analysis?.sections?.contact || false,
      summary: analysis?.sections?.summary || false,
      experience: analysis?.sections?.experience || false,
      education: analysis?.sections?.education || false,
      skills: analysis?.sections?.skills || false,
      projects: analysis?.sections?.projects || false,
      certifications: analysis?.sections?.certifications || false
    },
    content_analysis: {
      word_count: analysis?.content_analysis?.word_count || 0,
      has_quantified_achievements: analysis?.content_analysis?.has_quantified_achievements || false,
      action_verbs_count: analysis?.content_analysis?.action_verbs_count || 0,
      grammar_issues: analysis?.content_analysis?.grammar_issues || [],
      formatting_issues: analysis?.content_analysis?.formatting_issues || []
    },
    ats_compatibility: {
      score: analysis?.ats_compatibility?.score || 0,
      issues: analysis?.ats_compatibility?.issues || [],
      recommendations: analysis?.ats_compatibility?.recommendations || []
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
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header with Overall Score */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                  <div className={`p-3 rounded-full border-2 ${getScoreColor(safeAnalysis.ats_score)}`}>
                    {getScoreIcon(safeAnalysis.ats_score)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {safeAnalysis.ats_score}%
                    </h2>
                    <p className="text-gray-600">Overall ATS Score</p>
                  </div>
                </div>
                <p className="text-gray-700 max-w-2xl">
                  {safeAnalysis.ats_score >= 85 
                    ? "Excellent! Your resume is well-optimized for ATS systems and should perform well in automated screening."
                    : safeAnalysis.ats_score >= 70
                    ? "Good foundation! Your resume has potential but could benefit from some optimizations."
                    : "Needs improvement. Your resume may struggle with ATS systems and requires significant optimization."
                  }
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Report
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Share Results
                </Button>
                {onReanalyze && (
                  <Button 
                    onClick={onReanalyze}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Re-analyze
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Scores */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Detailed Analysis Scores
            </CardTitle>
            <CardDescription>
              Breakdown of your resume performance across key areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {Object.entries(safeAnalysis.detailed_scores).map(([key, score]) => (
                <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-bold mb-1 ${getScoreColor(score).split(' ')[0]}`}>
                    {score}%
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {key.replace('_', ' ')}
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        score >= 85 ? 'bg-green-500' : 
                        score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Critical Issues */}
      {safeAnalysis.feedback.critical_issues.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <XCircle className="h-5 w-5" />
                Critical Issues (Must Fix)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {safeAnalysis.feedback.critical_issues.map((issue, index) => (
                  <li key={index} className="flex items-start gap-2 text-red-700">
                    <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <motion.div variants={itemVariants}>
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              {safeAnalysis.feedback.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {safeAnalysis.feedback.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-green-700">
                      <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-green-600">No specific strengths identified. Focus on the improvements below.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Improvements */}
        <motion.div variants={itemVariants}>
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700">
                <AlertCircle className="h-5 w-5" />
                Improvements Needed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {safeAnalysis.feedback.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2 text-yellow-700">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Suggestions */}
      <motion.div variants={itemVariants}>
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Lightbulb className="h-5 w-5" />
              Optimization Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {safeAnalysis.feedback.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-blue-700">
                  <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Section Analysis */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Section Analysis
            </CardTitle>
            <CardDescription>
              Review which resume sections are present and complete
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {Object.entries(safeAnalysis.sections).map(([section, present]) => (
                <div key={section} className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    present ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {present ? <CheckCircle className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                  </div>
                  <div className="text-sm font-medium capitalize">
                    {section.replace('_', ' ')}
                  </div>
                  <div className={`text-xs ${present ? 'text-green-600' : 'text-red-600'}`}>
                    {present ? 'Present' : 'Missing'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Skills & Content Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Skills Detected ({safeAnalysis.skills.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {safeAnalysis.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {safeAnalysis.skills.slice(0, 20).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {safeAnalysis.skills.length > 20 && (
                    <Badge variant="outline" className="text-xs">
                      +{safeAnalysis.skills.length - 20} more
                    </Badge>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No technical skills detected. Consider adding a skills section.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Content Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Word Count:</span>
                  <span className="font-medium">{safeAnalysis.content_analysis.word_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Experience:</span>
                  <span className="font-medium">{safeAnalysis.experience_years} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Action Verbs:</span>
                  <span className="font-medium">{safeAnalysis.content_analysis.action_verbs_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantified Achievements:</span>
                  <span className={`font-medium ${
                    safeAnalysis.content_analysis.has_quantified_achievements ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {safeAnalysis.content_analysis.has_quantified_achievements ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ATS Compatibility:</span>
                  <span className={`font-medium ${getScoreColor(safeAnalysis.ats_compatibility.score).split(' ')[0]}`}>
                    {safeAnalysis.ats_compatibility.score}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ATS Compatibility Issues */}
      {safeAnalysis.ats_compatibility.issues.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertCircle className="h-5 w-5" />
                ATS Compatibility Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-orange-800 mb-2">Issues Found:</h4>
                  <ul className="space-y-1">
                    {safeAnalysis.ats_compatibility.issues.map((issue, index) => (
                      <li key={index} className="flex items-start gap-2 text-orange-700 text-sm">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-orange-800 mb-2">Recommendations:</h4>
                  <ul className="space-y-1">
                    {safeAnalysis.ats_compatibility.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-orange-700 text-sm">
                        <Lightbulb className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
