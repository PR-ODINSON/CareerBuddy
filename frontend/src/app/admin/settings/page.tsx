'use client';

import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { 
  Settings,
  ArrowLeft,
  Save,
  RefreshCw,
  Shield,
  Mail,
  Database,
  Bell,
  Globe,
  Lock,
  Users,
  Briefcase,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Server,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    supportEmail: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    emailVerificationRequired: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  security: {
    passwordMinLength: number;
    sessionTimeout: number;
    maxLoginAttempts: number;
    requireTwoFactor: boolean;
    allowPasswordReset: boolean;
  };
  features: {
    aiRecommendations: boolean;
    resumeAnalysis: boolean;
    jobMatching: boolean;
    counselorChat: boolean;
    notifications: boolean;
  };
  limits: {
    maxUsersPerCounselor: number;
    maxApplicationsPerUser: number;
    maxResumesPerUser: number;
    fileUploadSizeMB: number;
  };
}

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: 'CareerBuddy',
      siteDescription: 'AI-powered career guidance platform for students',
      supportEmail: 'support@careerbuddy.com',
      maintenanceMode: false,
      registrationEnabled: true,
      emailVerificationRequired: true,
    },
    email: {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: 'noreply@careerbuddy.com',
      fromName: 'CareerBuddy',
    },
    security: {
      passwordMinLength: 8,
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      requireTwoFactor: false,
      allowPasswordReset: true,
    },
    features: {
      aiRecommendations: true,
      resumeAnalysis: true,
      jobMatching: true,
      counselorChat: true,
      notifications: true,
    },
    limits: {
      maxUsersPerCounselor: 50,
      maxApplicationsPerUser: 100,
      maxResumesPerUser: 5,
      fileUploadSizeMB: 10,
    },
  });

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/auth/login');
      return;
    }
    loadSettings();
  }, [user, router]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from the API
      // const data = await apiClient.get('/admin/settings');
      // setSettings(data);
      
      // For now, we'll use the default settings
      setTimeout(() => setLoading(false), 1000);
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load system settings',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      // In a real implementation, this would save to the API
      // await apiClient.put('/admin/settings', settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Success',
        description: 'System settings saved successfully',
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save system settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const testEmailConnection = async () => {
    try {
      toast({
        title: 'Testing Connection',
        description: 'Testing email server connection...',
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Success',
        description: 'Email server connection successful',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to connect to email server',
        variant: 'destructive',
      });
    }
  };

  const resetToDefaults = () => {
    setSettings({
      general: {
        siteName: 'CareerBuddy',
        siteDescription: 'AI-powered career guidance platform for students',
        supportEmail: 'support@careerbuddy.com',
        maintenanceMode: false,
        registrationEnabled: true,
        emailVerificationRequired: true,
      },
      email: {
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        smtpPassword: '',
        fromEmail: 'noreply@careerbuddy.com',
        fromName: 'CareerBuddy',
      },
      security: {
        passwordMinLength: 8,
        sessionTimeout: 24,
        maxLoginAttempts: 5,
        requireTwoFactor: false,
        allowPasswordReset: true,
      },
      features: {
        aiRecommendations: true,
        resumeAnalysis: true,
        jobMatching: true,
        counselorChat: true,
        notifications: true,
      },
      limits: {
        maxUsersPerCounselor: 50,
        maxApplicationsPerUser: 100,
        maxResumesPerUser: 5,
        fileUploadSizeMB: 10,
      },
    });
    
    toast({
      title: 'Settings Reset',
      description: 'All settings have been reset to default values',
    });
  };

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
                onClick={() => router.push('/admin')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Settings className="h-8 w-8 text-blue-600 mr-3" />
                  System Settings
                </h1>
                <p className="text-gray-600 mt-1">Configure platform settings and preferences</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={resetToDefaults}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
              <Button onClick={saveSettings} disabled={saving}>
                {saving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" className="flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center">
              <Server className="h-4 w-4 mr-2" />
              Features
            </TabsTrigger>
            <TabsTrigger value="limits" className="flex items-center">
              <Database className="h-4 w-4 mr-2" />
              Limits
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Configuration</CardTitle>
                <CardDescription>
                  Basic platform settings and information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={settings.general.siteName}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, siteName: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={settings.general.supportEmail}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, supportEmail: e.target.value }
                      })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.general.siteDescription}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, siteDescription: e.target.value }
                    })}
                    rows={3}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-gray-600">
                        Enable to temporarily disable access to the platform
                      </p>
                    </div>
                    <Switch
                      checked={settings.general.maintenanceMode}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        general: { ...settings.general, maintenanceMode: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>User Registration</Label>
                      <p className="text-sm text-gray-600">
                        Allow new users to register accounts
                      </p>
                    </div>
                    <Switch
                      checked={settings.general.registrationEnabled}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        general: { ...settings.general, registrationEnabled: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Verification Required</Label>
                      <p className="text-sm text-gray-600">
                        Require email verification for new accounts
                      </p>
                    </div>
                    <Switch
                      checked={settings.general.emailVerificationRequired}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        general: { ...settings.general, emailVerificationRequired: checked }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
                <CardDescription>
                  Configure SMTP settings for sending emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      value={settings.email.smtpHost}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, smtpHost: e.target.value }
                      })}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      value={settings.email.smtpPort}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, smtpPort: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpUser">SMTP Username</Label>
                    <Input
                      id="smtpUser"
                      value={settings.email.smtpUser}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, smtpUser: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <div className="relative">
                      <Input
                        id="smtpPassword"
                        type={showSmtpPassword ? 'text' : 'password'}
                        value={settings.email.smtpPassword}
                        onChange={(e) => setSettings({
                          ...settings,
                          email: { ...settings.email, smtpPassword: e.target.value }
                        })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                      >
                        {showSmtpPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="fromEmail">From Email</Label>
                    <Input
                      id="fromEmail"
                      type="email"
                      value={settings.email.fromEmail}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, fromEmail: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fromName">From Name</Label>
                    <Input
                      id="fromName"
                      value={settings.email.fromName}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, fromName: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" onClick={testEmailConnection}>
                    <Mail className="h-4 w-4 mr-2" />
                    Test Connection
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Configuration</CardTitle>
                <CardDescription>
                  Configure security policies and authentication settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      min="6"
                      max="20"
                      value={settings.security.passwordMinLength}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, passwordMinLength: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      min="1"
                      max="168"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      min="3"
                      max="10"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-600">
                        Require 2FA for all user accounts
                      </p>
                    </div>
                    <Switch
                      checked={settings.security.requireTwoFactor}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        security: { ...settings.security, requireTwoFactor: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Password Reset</Label>
                      <p className="text-sm text-gray-600">
                        Allow users to reset their passwords via email
                      </p>
                    </div>
                    <Switch
                      checked={settings.security.allowPasswordReset}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        security: { ...settings.security, allowPasswordReset: checked }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Settings */}
          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Feature Configuration</CardTitle>
                <CardDescription>
                  Enable or disable platform features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>AI Recommendations</Label>
                    <p className="text-sm text-gray-600">
                      Enable AI-powered job and career recommendations
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.aiRecommendations}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      features: { ...settings.features, aiRecommendations: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Resume Analysis</Label>
                    <p className="text-sm text-gray-600">
                      Enable AI-powered resume analysis and feedback
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.resumeAnalysis}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      features: { ...settings.features, resumeAnalysis: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Job Matching</Label>
                    <p className="text-sm text-gray-600">
                      Enable intelligent job matching based on user profiles
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.jobMatching}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      features: { ...settings.features, jobMatching: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Counselor Chat</Label>
                    <p className="text-sm text-gray-600">
                      Enable real-time chat between students and counselors
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.counselorChat}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      features: { ...settings.features, counselorChat: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifications</Label>
                    <p className="text-sm text-gray-600">
                      Enable email and in-app notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.notifications}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      features: { ...settings.features, notifications: checked }
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Limits Settings */}
          <TabsContent value="limits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Limits</CardTitle>
                <CardDescription>
                  Configure platform usage limits and quotas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="maxUsersPerCounselor">Max Users per Counselor</Label>
                    <Input
                      id="maxUsersPerCounselor"
                      type="number"
                      min="10"
                      max="200"
                      value={settings.limits.maxUsersPerCounselor}
                      onChange={(e) => setSettings({
                        ...settings,
                        limits: { ...settings.limits, maxUsersPerCounselor: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxApplicationsPerUser">Max Applications per User</Label>
                    <Input
                      id="maxApplicationsPerUser"
                      type="number"
                      min="10"
                      max="500"
                      value={settings.limits.maxApplicationsPerUser}
                      onChange={(e) => setSettings({
                        ...settings,
                        limits: { ...settings.limits, maxApplicationsPerUser: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxResumesPerUser">Max Resumes per User</Label>
                    <Input
                      id="maxResumesPerUser"
                      type="number"
                      min="1"
                      max="20"
                      value={settings.limits.maxResumesPerUser}
                      onChange={(e) => setSettings({
                        ...settings,
                        limits: { ...settings.limits, maxResumesPerUser: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fileUploadSizeMB">File Upload Size Limit (MB)</Label>
                    <Input
                      id="fileUploadSizeMB"
                      type="number"
                      min="1"
                      max="100"
                      value={settings.limits.fileUploadSizeMB}
                      onChange={(e) => setSettings({
                        ...settings,
                        limits: { ...settings.limits, fileUploadSizeMB: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
