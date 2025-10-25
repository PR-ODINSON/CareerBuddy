import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Only redirect if we're not already on the login page
          // and if this isn't the initial auth check
          const currentPath = window.location.pathname;
          const isAuthCheck = error.config?.url?.includes('/users/me');
          
          if (!currentPath.includes('/auth/login') && !isAuthCheck) {
            localStorage.removeItem('token');
            window.location.href = '/auth/login';
          } else if (isAuthCheck) {
            // Just remove the token for auth checks, don't redirect
            localStorage.removeItem('token');
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async register(userData: any) {
    const response = await this.client.post('/auth/register', userData);
    return response.data;
  }

  async getProfile() {
    const response = await this.client.get('/users/me');
    return response.data;
  }

  async updateProfile(userData: any) {
    const response = await this.client.put('/users/me', userData);
    return response.data;
  }

  // Resume endpoints
  async getResumes() {
    const response = await this.client.get('/resumes');
    return response.data;
  }

  async uploadResume(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.client.post('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async analyzeResume(resumeId: string) {
    const response = await this.client.post(`/resumes/${resumeId}/analyze`);
    return response.data;
  }

  async setActiveResume(resumeId: string) {
    const response = await this.client.put(`/resumes/${resumeId}/set-active`);
    return response.data;
  }

  async deleteResume(resumeId: string) {
    const response = await this.client.delete(`/resumes/${resumeId}`);
    return response.data;
  }

  async getResumeAnalysis(resumeId: string) {
    const response = await this.client.get(`/resumes/${resumeId}/analysis`);
    return response.data;
  }

  // Job endpoints
  async getJobs(params?: any) {
    const response = await this.client.get('/jobs', { params });
    return response.data;
  }

  async searchJobs(searchParams: any) {
    const response = await this.client.get('/jobs/search', { params: searchParams });
    return response.data;
  }

  async getJobRecommendations(limit = 10) {
    const response = await this.client.get('/jobs/recommendations', { params: { limit } });
    return response.data;
  }

  async getResumeBasedJobRecommendations(analysisData: { skills: string[]; experience_years: number; ats_score: number }) {
    const response = await this.client.post('/jobs/recommendations', analysisData);
    return response.data;
  }

  async getJob(jobId: string) {
    const response = await this.client.get(`/jobs/${jobId}`);
    return response.data;
  }

  async createJob(jobData: any) {
    const response = await this.client.post('/jobs', jobData);
    return response.data;
  }

  // Application endpoints
  async getApplications(status?: string) {
    const params = status ? { status } : {};
    const response = await this.client.get('/applications', { params });
    return response.data;
  }

  async applyForJob(applicationData: any) {
    const response = await this.client.post('/applications', applicationData);
    return response.data;
  }

  async createApplication(applicationData: any) {
    const response = await this.client.post('/applications', applicationData);
    return response.data;
  }

  async getApplicationStats() {
    const response = await this.client.get('/applications/stats');
    return response.data;
  }

  async getUpcomingInterviews() {
    const response = await this.client.get('/applications/interviews/upcoming');
    return response.data;
  }

  async updateApplication(applicationId: string, updateData: any) {
    const response = await this.client.put(`/applications/${applicationId}`, updateData);
    return response.data;
  }

  async withdrawApplication(applicationId: string) {
    const response = await this.client.put(`/applications/${applicationId}/withdraw`);
    return response.data;
  }

  // Admin endpoints
  async getDashboardStats() {
    const response = await this.client.get('/admin/dashboard-stats');
    return response.data;
  }

  async getUserAnalytics(period = '30d') {
    const response = await this.client.get('/admin/analytics/users', { params: { period } });
    return response.data;
  }

  async getResumeAnalytics(period = '30d') {
    const response = await this.client.get('/admin/analytics/resumes', { params: { period } });
    return response.data;
  }

  async getJobAnalytics(period = '30d') {
    const response = await this.client.get('/admin/analytics/jobs', { params: { period } });
    return response.data;
  }

  async getAllUsers(page = 1, limit = 20, role?: string) {
    const params = { page, limit, ...(role && { role }) };
    const response = await this.client.get('/admin/users', { params });
    return response.data;
  }

  async getUserActivity(userId: string) {
    const response = await this.client.get(`/admin/users/${userId}/activity`);
    return response.data;
  }

  async moderateJob(jobId: string, action: 'approve' | 'reject', reason?: string) {
    const response = await this.client.put(`/admin/jobs/${jobId}/moderate`, { action, reason });
    return response.data;
  }

  // Generic HTTP methods for admin operations
  async get(url: string, params?: any) {
    const response = await this.client.get(url, { params });
    return response.data;
  }

  async post(url: string, data?: any) {
    const response = await this.client.post(url, data);
    return response.data;
  }

  async put(url: string, data?: any) {
    const response = await this.client.put(url, data);
    return response.data;
  }

  async delete(url: string) {
    const response = await this.client.delete(url);
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
