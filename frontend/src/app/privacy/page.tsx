'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  GraduationCap,
  Shield,
  FileText,
  Lock,
  Eye,
  Database,
  UserCheck,
  Globe,
  AlertTriangle
} from 'lucide-react';

export default function PrivacyPage() {
  const sections = [
    {
      id: 'overview',
      title: '1. Privacy Overview',
      icon: Shield,
      content: `At CareerBuddy, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered career intelligence platform. We are committed to protecting your personal information and your right to privacy.`
    },
    {
      id: 'information-collection',
      title: '2. Information We Collect',
      icon: Database,
      content: `We collect information you provide directly to us, such as:
      • Account information (name, email, password)
      • Resume and career profile data
      • Job preferences and career goals
      • Communication records with our support team
      • Payment information (processed securely by third-party providers)
      
      We also automatically collect certain information:
      • Device and browser information
      • IP address and location data
      • Usage patterns and analytics data
      • Cookies and similar tracking technologies`
    },
    {
      id: 'how-we-use',
      title: '3. How We Use Your Information',
      icon: UserCheck,
      content: `We use your information to:
      • Provide and improve our AI-powered services
      • Analyze and optimize your resume and career profile
      • Match you with relevant job opportunities
      • Send you personalized career recommendations
      • Process payments and manage your account
      • Communicate with you about our services
      • Comply with legal obligations
      • Protect against fraud and security threats`
    },
    {
      id: 'ai-processing',
      title: '4. AI and Machine Learning',
      icon: Eye,
      content: `Our AI systems process your career data to provide personalized insights and recommendations. This includes:
      • Resume analysis and optimization suggestions
      • Skills assessment and gap analysis
      • Job matching based on your profile and preferences
      • Career trajectory predictions and recommendations
      
      All AI processing is performed with strict privacy safeguards, and your data is never used to train models that benefit other users without your explicit consent.`
    },
    {
      id: 'data-sharing',
      title: '5. Information Sharing and Disclosure',
      icon: Globe,
      content: `We do not sell, trade, or rent your personal information to third parties. We may share your information only in these limited circumstances:
      • With your explicit consent
      • With service providers who assist in our operations (under strict confidentiality agreements)
      • When required by law or to protect our rights
      • In connection with a business transfer or acquisition
      • With potential employers, only when you explicitly apply for positions through our platform`
    },
    {
      id: 'data-security',
      title: '6. Data Security',
      icon: Lock,
      content: `We implement industry-standard security measures to protect your information:
      • End-to-end encryption for sensitive data
      • Secure data centers with 24/7 monitoring
      • Regular security audits and penetration testing
      • Multi-factor authentication options
      • SOC 2 Type II compliance
      • GDPR and CCPA compliance measures
      
      While we strive to protect your information, no method of transmission over the internet is 100% secure.`
    },
    {
      id: 'data-retention',
      title: '7. Data Retention',
      icon: Database,
      content: `We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. Specifically:
      • Account information: Until you delete your account
      • Resume and profile data: Until you remove it or delete your account
      • Usage analytics: Up to 2 years for service improvement
      • Communication records: Up to 3 years for support purposes
      
      You can request deletion of your data at any time through your account settings or by contacting us.`
    },
    {
      id: 'your-rights',
      title: '8. Your Privacy Rights',
      icon: UserCheck,
      content: `You have the right to:
      • Access and review your personal information
      • Correct or update inaccurate information
      • Delete your personal information
      • Export your data in a portable format
      • Opt-out of certain communications
      • Restrict processing of your information
      • Object to processing based on legitimate interests
      
      To exercise these rights, please contact us through your account settings or our privacy contact form.`
    },
    {
      id: 'cookies',
      title: '9. Cookies and Tracking',
      icon: Eye,
      content: `We use cookies and similar technologies to:
      • Remember your preferences and settings
      • Analyze site usage and improve our services
      • Provide personalized content and recommendations
      • Ensure security and prevent fraud
      
      You can control cookie settings through your browser, but some features may not function properly if cookies are disabled.`
    },
    {
      id: 'third-party',
      title: '10. Third-Party Services',
      icon: Globe,
      content: `Our platform may integrate with third-party services such as:
      • Payment processors (Stripe, PayPal)
      • Analytics providers (Google Analytics)
      • Cloud storage providers (AWS, Google Cloud)
      • Social media platforms for authentication
      
      These services have their own privacy policies, and we encourage you to review them.`
    },
    {
      id: 'international',
      title: '11. International Data Transfers',
      icon: Globe,
      content: `Your information may be transferred to and processed in countries other than your own. We ensure adequate protection through:
      • Standard Contractual Clauses approved by the European Commission
      • Adequacy decisions for certain countries
      • Other appropriate safeguards as required by applicable law
      
      We are committed to protecting your information regardless of where it is processed.`
    },
    {
      id: 'children',
      title: '12. Children\'s Privacy',
      icon: Shield,
      content: `Our services are not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16. If we become aware that we have collected personal information from a child under 16, we will take steps to delete such information promptly.`
    },
    {
      id: 'changes',
      title: '13. Changes to This Policy',
      icon: FileText,
      content: `We may update this Privacy Policy from time to time. We will notify you of any material changes by:
      • Posting the updated policy on our website
      • Sending you an email notification
      • Displaying a prominent notice in our application
      
      Your continued use of our services after any changes constitutes acceptance of the updated policy.`
    },
    {
      id: 'contact',
      title: '14. Contact Us',
      icon: UserCheck,
      content: `If you have any questions about this Privacy Policy or our privacy practices, please contact us:
      • Email: privacy@careerbuddy.com
      • Contact Form: Available on our website
      • Mail: CareerBuddy Privacy Team, 123 Innovation Drive, Tech City, TC 12345
      
      We will respond to your inquiry within 30 days.`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-800 relative overflow-hidden font-inter">
      {/* Background Elements */}
      <motion.div 
        className="absolute inset-0 opacity-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 1 }}
      >
        <motion.div 
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 0.8, 1.1, 1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </motion.div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:100px_100px] opacity-30" />

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/10 bg-black/30 backdrop-blur-2xl">
        <div className="container mx-auto px-6 py-5 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3 group">
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
          </Link>
          
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10 rounded-lg" asChild>
              <Link href="/" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Link>
            </Button>
          </motion.div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center mb-6">
              <motion.div 
                className="p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl mr-4"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Shield className="h-8 w-8 text-white" />
              </motion.div>
              <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
                Privacy Policy
              </h1>
            </div>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-6 font-light">
              Your privacy is our priority. Learn how we protect and handle your personal information.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-300 font-medium">
              <FileText className="h-4 w-4" />
              <span>Last updated: October 3, 2024</span>
            </div>
          </motion.div>

          {/* Privacy Commitment */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 mb-12 backdrop-blur-xl"
          >
            <div className="flex items-start space-x-3">
              <Lock className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-green-400 mb-2 tracking-tight">Our Privacy Commitment</h3>
                <p className="text-gray-200 leading-relaxed font-light">
                  We are committed to protecting your privacy and ensuring transparency in how we handle your data. 
                  This policy explains our practices in clear, understandable terms. We never sell your personal information 
                  and only use it to provide you with the best possible career guidance experience.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Privacy Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.05 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-all duration-300"
              >
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center tracking-tight">
                  <motion.div 
                    className="p-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg mr-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <section.icon className="h-5 w-5 text-white" />
                  </motion.div>
                  {section.title}
                </h2>
                <div className="text-gray-200 leading-relaxed whitespace-pre-line font-light">
                  {section.content}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Data Rights Summary */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-16"
          >
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-8 mb-8 backdrop-blur-xl">
              <div className="flex items-center mb-6">
                <UserCheck className="h-8 w-8 text-blue-400 mr-3" />
                <h3 className="text-2xl font-bold text-white tracking-tight">Quick Access to Your Rights</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span className="text-gray-200 font-medium">Access your data</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span className="text-gray-200 font-medium">Correct inaccurate information</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span className="text-gray-200 font-medium">Delete your account and data</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span className="text-gray-200 font-medium">Export your data</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span className="text-gray-200 font-medium">Opt-out of communications</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span className="text-gray-200 font-medium">Restrict data processing</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="text-center">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 mb-8">
                <div className="flex items-center justify-center mb-4">
                  <AlertTriangle className="h-8 w-8 text-amber-400 mr-3" />
                  <h3 className="text-2xl font-bold text-white tracking-tight">Questions about Privacy?</h3>
                </div>
                <p className="text-gray-200 mb-6 max-w-2xl mx-auto font-light">
                  Our privacy team is here to help. If you have questions about this policy or want to exercise your privacy rights, 
                  don't hesitate to reach out.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                      <Link href="/contact">Contact Privacy Team</Link>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-3 rounded-xl font-semibold" asChild>
                      <Link href="/terms">View Terms of Service</Link>
                    </Button>
                  </motion.div>
                </div>
              </div>

              <p className="text-gray-300 text-sm font-medium">
                © 2024 CareerBuddy. All rights reserved. This privacy policy is effective as of October 3, 2024.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
