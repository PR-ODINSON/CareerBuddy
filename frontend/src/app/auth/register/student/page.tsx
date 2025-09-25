'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, ArrowLeft, School, BookOpen, Calendar, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentDetailsPage() {
  const [formData, setFormData] = useState({
    university: '',
    major: '',
    graduationYear: new Date().getFullYear() + 1,
    currentYear: '',
    gpa: '',
  });
  const [personalDetails, setPersonalDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Get personal details from localStorage
    const stored = localStorage.getItem('registrationPersonalDetails');
    if (!stored) {
      toast({
        title: 'Missing personal details',
        description: 'Please complete the personal details first',
        variant: 'destructive',
      });
      router.push('/auth/register/personal');
      return;
    }
    setPersonalDetails(JSON.parse(stored));
  }, [router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!personalDetails) {
      toast({
        title: 'Error',
        description: 'Personal details not found. Please start over.',
        variant: 'destructive',
      });
      router.push('/auth/register/personal');
      return;
    }

    setLoading(true);

    try {
      // Combine personal and student details
      const { confirmPassword, ...personalData } = personalDetails;
      const registrationData = {
        ...personalData,
        ...formData,
        role: 'STUDENT',
      };

      // Remove undefined values to avoid validation issues
      Object.keys(registrationData).forEach(key => {
        if (registrationData[key] === undefined || registrationData[key] === '') {
          delete registrationData[key];
        }
      });

      await register(registrationData);
      
      // Clear stored data
      localStorage.removeItem('registrationPersonalDetails');
      
      toast({
        title: 'Registration successful!',
        description: 'Welcome to CareerBuddy! Your account has been created.',
      });
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'graduationYear' ? parseInt(value) || '' : 
              name === 'gpa' ? (value === '' ? undefined : parseFloat(value)) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBack = () => {
    router.push('/auth/register/personal');
  };

  if (!personalDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <motion.div 
        className="absolute inset-0 opacity-40"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 40% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
          ]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <motion.div 
              className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <GraduationCap className="h-8 w-8 text-white" />
            </motion.div>
            <span className="text-3xl font-bold text-white tracking-tight">CareerBuddy</span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold text-white mb-2">
                Student Information
              </CardTitle>
              <CardDescription className="text-gray-200">
                Step 2 of 2 - Tell us about your academic background
              </CardDescription>
              
              {/* Progress indicator */}
              <div className="flex items-center justify-center mt-6 space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div className="w-12 h-1 bg-green-500 rounded-full"></div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div 
                  className="space-y-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Label htmlFor="university" className="text-white font-medium">
                    <School className="w-4 h-4 inline mr-2" />
                    University
                  </Label>
                  <Input
                    id="university"
                    name="university"
                    placeholder="University of Technology"
                    value={formData.university}
                    onChange={handleChange}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:border-blue-400 focus:ring-blue-400/20"
                  />
                </motion.div>

                <motion.div 
                  className="space-y-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Label htmlFor="major" className="text-white font-medium">
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Major/Field of Study
                  </Label>
                  <Input
                    id="major"
                    name="major"
                    placeholder="Computer Science"
                    value={formData.major}
                    onChange={handleChange}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:border-blue-400 focus:ring-blue-400/20"
                  />
                </motion.div>

                <div className="grid grid-cols-2 gap-4">
                  <motion.div 
                    className="space-y-2"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Label htmlFor="currentYear" className="text-white font-medium">
                      Current Year
                    </Label>
                    <Select onValueChange={(value) => handleSelectChange('currentYear', value)}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1st">1st Year</SelectItem>
                        <SelectItem value="2nd">2nd Year</SelectItem>
                        <SelectItem value="3rd">3rd Year</SelectItem>
                        <SelectItem value="4th">4th Year</SelectItem>
                        <SelectItem value="graduate">Graduate</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  <motion.div 
                    className="space-y-2"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Label htmlFor="graduationYear" className="text-white font-medium">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Graduation Year
                    </Label>
                    <Input
                      id="graduationYear"
                      name="graduationYear"
                      type="number"
                      min={new Date().getFullYear()}
                      max={new Date().getFullYear() + 10}
                      value={formData.graduationYear}
                      onChange={handleChange}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:border-blue-400 focus:ring-blue-400/20"
                    />
                  </motion.div>
                </div>

                <motion.div 
                  className="space-y-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Label htmlFor="gpa" className="text-white font-medium">
                    GPA (Optional)
                  </Label>
                  <Input
                    id="gpa"
                    name="gpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.0"
                    placeholder="3.5"
                    value={formData.gpa}
                    onChange={handleChange}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:border-blue-400 focus:ring-blue-400/20"
                  />
                  <p className="text-xs text-gray-300 mt-1">On a 4.0 scale</p>
                </motion.div>

                <div className="flex space-x-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button 
                      type="button"
                      onClick={handleBack}
                      variant="outline"
                      className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 font-medium py-3 rounded-xl transition-all duration-300"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" 
                      disabled={loading}
                    >
                      {loading ? (
                        'Creating Account...'
                      ) : (
                        <span className="flex items-center justify-center">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Complete Registration
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </form>

              <div className="mt-6">
                <div className="text-center text-sm text-gray-300">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                    Sign in
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
