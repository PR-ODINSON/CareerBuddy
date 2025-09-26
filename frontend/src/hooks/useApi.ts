import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

// Resume hooks
export function useResumes() {
  return useQuery({
    queryKey: ['resumes'],
    queryFn: () => apiClient.getResumes(),
  });
}

export function useUploadResume() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (file: File) => apiClient.uploadResume(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      toast({
        title: "Success",
        description: "Resume uploaded successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to upload resume",
        variant: "destructive",
      });
    },
  });
}

export function useAnalyzeResume() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (resumeId: string) => apiClient.analyzeResume(resumeId),
    onSuccess: () => {
      toast({
        title: "Analysis Started",
        description: "Your resume is being analyzed. You'll receive feedback shortly.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to analyze resume",
        variant: "destructive",
      });
    },
  });
}

export function useSetActiveResume() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (resumeId: string) => apiClient.setActiveResume(resumeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      toast({
        title: "Success",
        description: "Active resume updated!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to set active resume",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (resumeId: string) => apiClient.deleteResume(resumeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      toast({
        title: "Success",
        description: "Resume deleted successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete resume",
        variant: "destructive",
      });
    },
  });
}

// Job hooks
export function useJobs(params?: any) {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: () => apiClient.getJobs(params),
  });
}

export function useSearchJobs(searchParams: any, enabled = true) {
  return useQuery({
    queryKey: ['jobs', 'search', searchParams],
    queryFn: () => apiClient.searchJobs(searchParams),
    enabled: enabled && Object.keys(searchParams).length > 0,
  });
}

export function useJobRecommendations(limit = 10) {
  return useQuery({
    queryKey: ['jobs', 'recommendations', limit],
    queryFn: () => apiClient.getJobRecommendations(limit),
  });
}

export function useJob(jobId: string) {
  return useQuery({
    queryKey: ['jobs', jobId],
    queryFn: () => apiClient.getJob(jobId),
    enabled: !!jobId,
  });
}

export function useApplyForJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (applicationData: any) => apiClient.applyForJob(applicationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast({
        title: "Application Submitted",
        description: "Your job application has been submitted successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit application",
        variant: "destructive",
      });
    },
  });
}

// Application hooks
export function useApplications(status?: string) {
  return useQuery({
    queryKey: ['applications', status],
    queryFn: () => apiClient.getApplications(status),
  });
}

export function useApplicationStats() {
  return useQuery({
    queryKey: ['applications', 'stats'],
    queryFn: () => apiClient.getApplicationStats(),
  });
}

export function useUpcomingInterviews() {
  return useQuery({
    queryKey: ['interviews', 'upcoming'],
    queryFn: () => apiClient.getUpcomingInterviews(),
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ applicationId, updateData }: { applicationId: string; updateData: any }) =>
      apiClient.updateApplication(applicationId, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast({
        title: "Success",
        description: "Application updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update application",
        variant: "destructive",
      });
    },
  });
}

export function useWithdrawApplication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (applicationId: string) => apiClient.withdrawApplication(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast({
        title: "Application Withdrawn",
        description: "Your application has been withdrawn.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to withdraw application",
        variant: "destructive",
      });
    },
  });
}

// Admin hooks
export function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => apiClient.getDashboardStats(),
  });
}

export function useUserAnalytics(period = '30d') {
  return useQuery({
    queryKey: ['admin', 'analytics', 'users', period],
    queryFn: () => apiClient.getUserAnalytics(period),
  });
}

export function useResumeAnalytics(period = '30d') {
  return useQuery({
    queryKey: ['admin', 'analytics', 'resumes', period],
    queryFn: () => apiClient.getResumeAnalytics(period),
  });
}

export function useJobAnalytics(period = '30d') {
  return useQuery({
    queryKey: ['admin', 'analytics', 'jobs', period],
    queryFn: () => apiClient.getJobAnalytics(period),
  });
}

export function useAllUsers(page = 1, limit = 20, role?: string) {
  return useQuery({
    queryKey: ['admin', 'users', page, limit, role],
    queryFn: () => apiClient.getAllUsers(page, limit, role),
  });
}

export function useUserActivity(userId: string) {
  return useQuery({
    queryKey: ['admin', 'users', userId, 'activity'],
    queryFn: () => apiClient.getUserActivity(userId),
    enabled: !!userId,
  });
}

export function useModerateJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ jobId, action, reason }: { jobId: string; action: 'approve' | 'reject'; reason?: string }) =>
      apiClient.moderateJob(jobId, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      toast({
        title: "Success",
        description: "Job moderation action completed!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to moderate job",
        variant: "destructive",
      });
    },
  });
}
