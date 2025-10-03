'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast({
        title: 'Login successful',
        description: 'Welcome back to CareerBuddy!',
      });
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          style={{
            left: `${10 + i * 12}%`,
            top: `${20 + i * 8}%`,
          }}
          animate={{
            y: [-20, -60, -20],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3
          }}
        />
      ))}

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
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <CardTitle className="text-3xl font-bold text-white mb-2">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-gray-200 text-lg">
                  Sign in to continue your career journey
                </CardDescription>
              </motion.div>
              
              {/* Welcome back animation */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.6 }}
                className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mt-4"
              />
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div 
                  className="space-y-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Label htmlFor="email" className="text-white font-medium">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-300"
                  />
                </motion.div>

                <motion.div 
                  className="space-y-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Label htmlFor="password" className="text-white font-medium">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:border-blue-400 focus:ring-blue-400/20 pr-12 transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group" 
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        Sign In
                        <motion.div
                          className="ml-2"
                          animate={{ x: [0, 3, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        >
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </motion.div>
                      </span>
                    )}
                  </Button>
                </motion.div>
              </form>

              <div className="mt-8">
                <div className="text-center text-sm text-gray-300">
                  Don&apos;t have an account?{' '}
                  <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors font-medium">
                    Create one now
                  </Link>
                </div>
              </div>

              {/* Demo Accounts */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mt-8 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
              >
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    🚀
                  </motion.div>
                  <span className="ml-2">Quick Demo Access</span>
                </h3>
                <div className="space-y-3 text-xs">
                  {[
                    { role: "Student", email: "student@careerbuddy.com", password: "student123", icon: "🎓" },
                    { role: "Counsellor", email: "counselor@careerbuddy.com", password: "counselor123", icon: "👩‍🏫" },
                    { role: "Admin", email: "admin@careerbuddy.com", password: "admin123", icon: "👨‍💼" }
                  ].map((demo, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300 cursor-pointer"
                      whileHover={{ scale: 1.02, x: 5 }}
                      onClick={() => {
                        setEmail(demo.email);
                        setPassword(demo.password);
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{demo.icon}</span>
                        <div>
                          <div className="text-white font-medium">{demo.role}</div>
                          <div className="text-gray-300">{demo.email}</div>
                        </div>
                      </div>
                      <div className="text-gray-400 text-xs">Click to use</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
