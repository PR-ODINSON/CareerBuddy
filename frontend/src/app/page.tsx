'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { 
  GraduationCap, 
  Users, 
  BarChart3, 
  FileText, 
  BrainCircuit, 
  Target, 
  Star,
  Shield,
  Award,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Globe,
  Building2,
  Code,
  Palette,
  Monitor,
  Database,
  Layers,
  Download,
  Play,
  Rocket,
  Brain,
  LineChart,
  Briefcase,
  Clock,
  Search,
  ChevronRight,
  Check
} from 'lucide-react';

// Enhanced animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

const tiltVariants = {
  rest: { rotateX: 0, rotateY: 0, z: 0 },
  hover: { 
    rotateX: 5, 
    rotateY: 10, 
    z: 50
  }
};

export default function HomePage() {
  const [activeSection, setActiveSection] = useState('hero');
  const heroRef = useRef(null);
  const howItWorksRef = useRef(null);
  const featuresRef = useRef(null);
  const testimonialsRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const [showDemo, setShowDemo] = useState(false);
  const [demoPhase, setDemoPhase] = useState<'idle' | 'analyzing' | 'scoring' | 'done'>('idle');
  const [demoScore, setDemoScore] = useState<number | null>(null);
  
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);
  
  // Mouse tracking for interactive elements
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 200, damping: 40 });
  const springY = useSpring(mouseY, { stiffness: 200, damping: 40 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set((clientX - innerWidth / 2) / 30);
      mouseY.set((clientY - innerHeight / 2) / 30);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Active section tracking
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'hero', ref: heroRef },
        { id: 'how-it-works', ref: howItWorksRef },
        { id: 'features', ref: featuresRef },
        { id: 'testimonials', ref: testimonialsRef }
      ];

      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = section.ref.current;
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Call once to set initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Demo modal simulation
  useEffect(() => {
    if (showDemo) {
      setDemoPhase('analyzing');
      const t1 = setTimeout(() => setDemoPhase('scoring'), 1200);
      const t2 = setTimeout(() => {
        setDemoPhase('done');
        const score = Math.floor(82 + Math.random() * 14);
        setDemoScore(score);
      }, 3000);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      setDemoPhase('idle');
      setDemoScore(null);
    }
  }, [showDemo]);

  const features = [
    {
      icon: Brain,
      title: 'AI Resume Analysis',
      description: 'Advanced NLP algorithms analyze and optimize your resume for maximum impact.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Search,
      title: 'Intelligent Job Matching',
      description: 'Machine learning algorithms match you with perfect opportunities based on your skills.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: LineChart,
      title: 'Progress Analytics',
      description: 'Real-time insights and analytics to track your career growth journey.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Users,
      title: 'Expert Network',
      description: 'Connect with industry professionals and career counselors for guidance.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Briefcase,
      title: 'Application Tracking',
      description: 'Comprehensive application management with automated follow-ups.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Rocket,
      title: 'Career Acceleration',
      description: 'Fast-track your career with personalized development plans.',
      color: 'from-teal-500 to-blue-500'
    },
  ];


  const trustMetrics = [
    { number: '50K+', label: 'Students Helped', icon: Users },
    { number: '95%', label: 'Success Rate', icon: TrendingUp },
    { number: '500+', label: 'Partner Companies', icon: Award },
  ];

  const companyLogos = [
    { 
      name: 'Google', 
      logo: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      ),
      color: 'from-blue-500 to-green-500',
      bgColor: 'bg-white'
    },
    { 
      name: 'Microsoft', 
      logo: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path fill="#F25022" d="M1 1h10v10H1z"/>
          <path fill="#00A4EF" d="M13 1h10v10H13z"/>
          <path fill="#7FBA00" d="M1 13h10v10H1z"/>
          <path fill="#FFB900" d="M13 13h10v10H13z"/>
        </svg>
      ),
      color: 'from-blue-600 to-cyan-500',
      bgColor: 'bg-white'
    },
    { 
      name: 'Apple', 
      logo: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" fill="#000000"/>
        </svg>
      ),
      color: 'from-gray-600 to-gray-800',
      bgColor: 'bg-white'
    },
    { 
      name: 'Meta', 
      logo: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
        </svg>
      ),
      color: 'from-blue-500 to-purple-500',
      bgColor: 'bg-white'
    },
    { 
      name: 'Netflix', 
      logo: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 22.951c-.043-7.86-.004-15.913.002-22.95zM5.398 1.05V24c2.873-.358 5.398-.898 5.398-.898V1.05z" fill="#E50914"/>
        </svg>
      ),
      color: 'from-red-500 to-red-700',
      bgColor: 'bg-white'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer',
      company: 'Google',
      content: 'The automation from design to code with CareerBuddy is incredibly powerful. The ability to reference the same career goals and track progress saves us incredible time.',
      rating: 5,
      logo: '🔵'
    },
    {
      name: 'Mike Chen', 
      role: 'Product Manager',
      company: 'Microsoft',
      content: 'CareerBuddy brought us confidence and ease of mind. Before, we used to be cautious about career moves. Now we\'re confident about our next steps.',
      rating: 5,
      logo: '🔶'
    },
    {
      name: 'Emily Davis',
      role: 'Data Scientist', 
      company: 'Amazon',
      content: 'Thanks to CareerBuddy, my whole mindset evolved, and it really changed how I approach career development and job applications.',
      rating: 5,
      logo: '🟠'
    },
  ];

  const productFeatures = [
    {
      icon: FileText,
      title: 'AI Resume Builder',
      description: 'Create professional resumes with AI-powered optimization',
      detail: 'Smart suggestions, ATS-friendly formats, real-time feedback'
    },
    {
      icon: BrainCircuit,
      title: 'Career Intelligence',
      description: 'Personalized career guidance powered by machine learning',
      detail: 'Market insights, skill gap analysis, growth recommendations'
    },
    {
      icon: Target,
      title: 'Job Matching Engine',
      description: 'Find perfect opportunities tailored to your profile',
      detail: 'Smart filtering, company culture fit, salary insights'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-800 relative overflow-hidden font-poppins">
      {/* Enhanced Animated Background */}
      <motion.div 
        className="absolute inset-0 opacity-40"
        style={{ x: springX, y: springY }}
      >
        {/* Morphing gradient blobs */}
        <motion.div 
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl"
          animate={shouldReduceMotion ? undefined : {
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            borderRadius: ["50%", "40%", "50%"]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-40 right-40 w-80 h-80 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"
          animate={shouldReduceMotion ? undefined : {
            scale: [1, 0.8, 1.1, 1],
            rotate: [360, 180, 0],
            borderRadius: ["50%", "60%", "40%", "50%"]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div 
          className="absolute bottom-40 left-1/3 w-72 h-72 bg-gradient-to-r from-teal-500/30 to-green-500/30 rounded-full blur-3xl"
          animate={shouldReduceMotion ? undefined : {
            scale: [1, 1.3, 0.9, 1],
            rotate: [0, -180, -360],
            borderRadius: ["50%", "30%", "60%", "50%"]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
        />
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
            }}
            animate={shouldReduceMotion ? undefined : {
              y: [-20, -40, -20],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5
            }}
          />
        ))}
      </motion.div>

      {/* Enhanced Grid Pattern */}
      <motion.div 
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:100px_100px]"
        style={{
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 70%)",
          x: springX,
          y: springY
        }}
      />

      {/* Enhanced Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-50 border-b border-white/10 bg-black/30 backdrop-blur-2xl"
      >
        <div className="container mx-auto px-6 py-5 flex justify-between items-center">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-3 group cursor-pointer"
          >
            <motion.div 
              className="relative p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl"
              whileHover={{ 
                boxShadow: "0 0 30px rgba(59, 130, 246, 0.4)",
                scale: 1.1 
              }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <GraduationCap className="h-6 w-6 text-white" />
            </motion.div>
            <span className="text-2xl font-bold text-white tracking-tight">
              CareerBuddy
            </span>
          </motion.div>
          
          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex items-center space-x-8">
              {[
                { href: "#how-it-works", label: "How it works", id: "how-it-works" },
                { href: "#features", label: "Features", id: "features" },
                { href: "#testimonials", label: "Success Stories", id: "testimonials" }
              ].map((item, index) => (
                <motion.a
                  key={index}
                  href={item.href}
                  className={`relative font-medium transition-all duration-300 ${
                    activeSection === item.id 
                      ? 'text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {item.label}
                  <motion.div
                    className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-violet-400 to-indigo-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: activeSection === item.id ? "100%" : "0%"
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  />
                  <motion.div
                    className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-300 to-indigo-300 rounded-full"
                    whileHover={{ width: activeSection === item.id ? "0%" : "100%" }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  />
                </motion.a>
              ))}
            </nav>
            <div className="flex items-center space-x-4">
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }} 
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button className="relative bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 rounded-xl px-8 py-3 font-semibold shadow-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 overflow-hidden group" asChild>
                  <Link href="/auth/login">
                    <span className="relative z-10 flex items-center">
                      Sign In
                      <motion.div
                        className="ml-2 inline-block"
                        animate={{ x: [0, 3, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </motion.div>
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400"
                      initial={{ x: "100%" }}
                      whileHover={{ x: "0%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative z-10 container mx-auto px-6 pt-20 pb-32">
        <div className="max-w-7xl mx-auto text-center">
          
          {/* Trust Badge */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8"
          >
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-gray-200">Trusted by 50,000+ students worldwide</span>
          </motion.div>

          {/* Main Heading */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="space-y-8 mb-12"
          >
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.9] tracking-tight">
              Your AI-Powered
              <motion.span 
                initial={{ backgroundPosition: "200% center" }}
                animate={{ backgroundPosition: "0% center" }}
                transition={{ delay: 1, duration: 2, ease: "easeInOut" }}
                className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent bg-[length:200%_100%]"
              >
                Career Engine
              </motion.span>
        </h1>
            <motion.p 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            >
              Transform your career with AI-driven insights, smart job matching, and personalized guidance. 
              Built for the next generation of professionals.
            </motion.p>
          </motion.div>

          {/* CTA Button */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8, ease: "easeInOut" }}
            className="flex justify-center items-center mb-16"
          >
            <motion.div 
              whileHover={{ scale: 1.05, y: -2 }} 
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Button size="lg" className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white px-10 py-4 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-violet-500/30 transition-all duration-500 group relative overflow-hidden" asChild>
                <Link href="/auth/register">
                  <span className="relative z-10 flex items-center">
                    Start Your Journey
                    <motion.div
                      className="ml-2 inline-block"
                      animate={{ x: [0, 3, 0] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.div>
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-violet-400 to-indigo-400"
                    initial={{ x: "100%" }}
                    whileHover={{ x: "0%" }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </Link>
          </Button>
            </motion.div>
          </motion.div>

          {/* Interactive Demo Preview */}
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.6, duration: 1.2, ease: "easeOut" }}
            className="relative max-w-7xl mx-auto"
          >
            <motion.div 
              className="relative bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl border border-white/20 p-8 shadow-2xl overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Glassmorphism Dashboard Preview */}
              <div className="bg-white/5 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden">
                {/* Top Navigation Bar */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <span className="text-white/60 text-sm font-medium">CareerBuddy Dashboard</span>
                  </div>
                  <div className="text-white/40 text-xs">Live Preview</div>
                </div>

                {/* Main Dashboard Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <motion.div 
                    variants={tiltVariants}
                    initial="rest"
                    whileHover="hover"
                    className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-6 backdrop-blur-sm border border-white/10 cursor-pointer"
                  >
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Brain className="h-8 w-8 text-blue-400 mb-3" />
                    </motion.div>
                    <h3 className="text-white font-semibold mb-2">Resume Score</h3>
                    <motion.div 
                      className="text-3xl font-bold text-blue-400"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      94%
                    </motion.div>
                    <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "94%" }}
                        transition={{ duration: 2, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    variants={tiltVariants}
                    initial="rest"
                    whileHover="hover"
                    className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 backdrop-blur-sm border border-white/10 cursor-pointer"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Target className="h-8 w-8 text-purple-400 mb-3" />
                    </motion.div>
                    <h3 className="text-white font-semibold mb-2">Job Matches</h3>
                    <motion.div 
                      className="text-3xl font-bold text-purple-400"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2.2, repeat: Infinity }}
                    >
                      127
                    </motion.div>
                    <div className="mt-2 flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="h-2 w-full bg-white/10 rounded-full overflow-hidden"
                          initial={{ opacity: 0.3 }}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                        >
                          <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400" />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    variants={tiltVariants}
                    initial="rest"
                    whileHover="hover"
                    className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-6 backdrop-blur-sm border border-white/10 cursor-pointer"
                  >
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <TrendingUp className="h-8 w-8 text-green-400 mb-3" />
                    </motion.div>
                    <h3 className="text-white font-semibold mb-2">Success Rate</h3>
                    <motion.div 
                      className="text-3xl font-bold text-green-400"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                    >
                      95%
                    </motion.div>
                    <div className="mt-2 flex items-end space-x-1 h-8">
                      {[...Array(7)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="bg-gradient-to-t from-green-400 to-emerald-400 rounded-sm"
                          style={{ width: '8px', height: `${20 + i * 8}%` }}
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Animated Company Logos Marquee */}
                <div className="relative overflow-hidden">
                  <motion.div
                    className="flex space-x-8"
                    animate={shouldReduceMotion ? undefined : { x: [0, -1200] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear", repeatType: "loop" }}
                  >
                    {[...companyLogos, ...companyLogos, ...companyLogos].map((company, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center space-x-2 flex-shrink-0"
                        whileHover={{ scale: 1.1, y: -2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <div className={`${company.bgColor} w-10 h-10 rounded-xl shadow-lg flex items-center justify-center border border-white/20`}>
                          <div className="text-gray-700">
                            {company.logo}
                          </div>
                        </div>
                        <span className="text-white/60 text-sm font-medium whitespace-nowrap">{company.name}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>

              {/* Floating action indicators */}
              <motion.div
                className="absolute top-4 right-4 w-3 h-3 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* How it works Section */}
      <section ref={howItWorksRef} id="how-it-works" className="relative py-24">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">How it works</h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto font-light">Three simple steps to accelerate your job search with AI.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            <motion.div 
              initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl"><FileText className="h-5 w-5 text-white" /></div>
                <span className="text-white font-semibold">Step 1</span>
              </div>
              <h3 className="text-white text-xl font-bold mb-2">Upload your resume</h3>
              <p className="text-gray-200">Import your resume or paste your profile link. We parse everything instantly.</p>
            </motion.div>

            <motion.div 
              initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.1 }} viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl"><CheckCircle className="h-5 w-5 text-white" /></div>
                <span className="text-white font-semibold">Step 2</span>
              </div>
              <h3 className="text-white text-xl font-bold mb-2">Get AI fixes</h3>
              <p className="text-gray-200">Receive prioritized fixes, bullet re-writes, and ATS‑score improvements.</p>
            </motion.div>

            <motion.div 
              initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl"><Target className="h-5 w-5 text-white" /></div>
                <span className="text-white font-semibold">Step 3</span>
              </div>
              <h3 className="text-white text-xl font-bold mb-2">Match and apply</h3>
              <p className="text-gray-200">Discover top matches and apply with tailored resumes in one click.</p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} id="features" className="relative py-24">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Career intelligence at your fingertips
        </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto font-light">
              Advanced AI algorithms and machine learning models power every aspect of CareerBuddy, 
              delivering personalized insights and actionable recommendations.
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
          {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  y: -8,
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 400, damping: 17 }
                }}
                className="group perspective-1000"
              >
                <motion.div 
                  initial={{ rotateX: 0, rotateY: 0, z: 0 }}
                  whileHover={{ 
                    rotateX: 5, 
                    rotateY: 10, 
                    z: 50,
                    transition: { type: "spring", stiffness: 300, damping: 20 }
                  }}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20 h-full relative overflow-hidden hover:bg-white/15"
                >
                  {/* Background gradient on hover */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(135deg, ${feature.color.split(' ')[1]}, ${feature.color.split(' ')[3]})`
                    }}
                  />
                  
                  <motion.div 
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} p-4 mb-6 relative`}
                    whileHover={{ 
                      scale: 1.15,
                      rotateY: 15,
                      boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        duration: 4,
                        repeat: Infinity,
                        delay: index * 0.5
                      }}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    
                    {/* Floating particles around icon */}
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white/40 rounded-full"
                        style={{
                          left: `${20 + i * 20}%`,
                          top: `${15 + i * 25}%`,
                        }}
                        animate={{
                          y: [-5, -15, -5],
                          opacity: [0.4, 0.8, 0.4],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{
                          duration: 2 + i * 0.5,
                          repeat: Infinity,
                          delay: i * 0.3
                        }}
                      />
                    ))}
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-gray-100 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-200 leading-relaxed group-hover:text-gray-100 transition-colors">
                  {feature.description}
                  </p>
                  
                  {/* Hover effect - subtle arrow */}
                  <motion.div
                    className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100"
                    initial={{ x: -10, opacity: 0 }}
                    whileHover={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ArrowRight className="h-5 w-5 text-gray-300" />
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* Testimonials Section */}
      <section ref={testimonialsRef} id="testimonials" className="relative py-24">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Loved by career professionals
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto font-light">
              Join thousands of students and professionals who have transformed their careers with CareerBuddy.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20 hover:bg-white/15"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xl text-white">
                    {testimonial.logo}
                  </div>
                  <div>
                    <p className="font-bold text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-200">{testimonial.role}</p>
                    <p className="text-xs text-gray-300 font-medium">{testimonial.company}</p>
                  </div>
                </div>
                <blockquote className="text-gray-100 leading-relaxed text-lg">
                  "{testimonial.content}"
                </blockquote>
                <div className="flex items-center mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust Metrics */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {trustMetrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center space-x-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                    <metric.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-5xl font-bold text-white">{metric.number}</span>
                </div>
                <p className="text-gray-200 font-medium text-lg">{metric.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-24">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:72px_72px]"></div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Ready to accelerate your career?
            </h2>
            <p className="text-xl md:text-2xl text-gray-100 mb-12">
              Join 50,000+ professionals who have transformed their careers with AI-powered insights.
            </p>
            
            <div className="flex justify-center mb-16">
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }} 
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Button size="lg" className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white px-10 py-4 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-violet-500/30 transition-all duration-500" asChild>
            <Link href="/auth/register">Get Started Free</Link>
          </Button>
              </motion.div>
            </div>

            {/* Company Trust Logos */}
            <div className="opacity-90">
              <p className="text-white mb-10 text-lg font-medium">Trusted by students at</p>
              <div className="flex flex-wrap justify-center items-center gap-10">
                {companyLogos.map((company, index) => (
                  <motion.div 
                    key={index}
                    whileHover={{ 
                      scale: 1.15, 
                      y: -4,
                      transition: { type: "spring", stiffness: 300, damping: 15 }
                    }}
                    className="group cursor-pointer"
                  >
                    <motion.div 
                      className={`${company.bgColor} w-16 h-16 rounded-2xl shadow-lg hover:shadow-xl flex items-center justify-center border border-gray-200/50 group-hover:border-gray-300/70 transition-all duration-300`}
                      whileHover={{
                        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                        background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))"
                      }}
                    >
                      <motion.div
                        className="text-gray-700 group-hover:text-gray-900 transition-colors duration-300"
                        whileHover={{ scale: 1.1 }}
                      >
                        {company.logo}
                      </motion.div>
                    </motion.div>
                    <motion.p 
                      className="text-center mt-3 text-sm font-semibold text-white group-hover:text-gray-100 transition-colors duration-300"
                      initial={{ opacity: 0.8 }}
                      whileHover={{ opacity: 1 }}
                    >
                      {company.name}
                    </motion.p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-black/60 backdrop-blur-lg border-t border-white/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Button asChild className="flex-1 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white rounded-xl">
            <Link href="/auth/register">Get Started</Link>
          </Button>
          <Button variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10 rounded-xl" onClick={() => setShowDemo(true)}>
            Try Demo
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative text-white">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="flex items-center space-x-3 mb-6"
              >
                <div className="p-2 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-xl">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">CareerBuddy</span>
              </motion.div>
              
              <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
                AI-powered career intelligence platform designed for the next generation of professionals. 
                Transform your career with data-driven insights.
              </p>
              
              <div className="inline-flex items-center space-x-2 bg-white/10 border border-white/20 rounded-lg px-4 py-2 backdrop-blur-sm">
                <Shield className="h-4 w-4 text-gray-300" />
                <span className="text-sm font-medium text-gray-300">SOC 2 Type II Certified</span>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Resume Builder</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Career Guidance</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Job Matching</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              ©2025 CareerBuddy · All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Database className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Monitor className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Try Demo Modal Layer
// Rendered conditionally above in the page via state; no separate export
