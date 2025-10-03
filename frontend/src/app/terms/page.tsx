'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  GraduationCap,
  Shield,
  FileText,
  Scale,
  AlertTriangle
} from 'lucide-react';

export default function TermsPage() {
  const sections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      content: `By accessing and using CareerBuddy ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`
    },
    {
      id: 'description',
      title: '2. Service Description',
      content: `CareerBuddy is an AI-powered career intelligence platform that provides resume analysis, job matching, career guidance, and related services. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time.`
    },
    {
      id: 'user-accounts',
      title: '3. User Accounts',
      content: `To access certain features of the Service, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.`
    },
    {
      id: 'acceptable-use',
      title: '4. Acceptable Use Policy',
      content: `You agree not to use the Service to:
      • Upload false, misleading, or fraudulent information
      • Violate any applicable laws or regulations
      • Infringe upon the rights of others
      • Distribute spam, malware, or other harmful content
      • Attempt to gain unauthorized access to our systems
      • Use the service for any commercial purpose without our consent`
    },
    {
      id: 'intellectual-property',
      title: '5. Intellectual Property Rights',
      content: `The Service and its original content, features, and functionality are and will remain the exclusive property of CareerBuddy and its licensors. The Service is protected by copyright, trademark, and other laws. You may not reproduce, distribute, or create derivative works without our express written permission.`
    },
    {
      id: 'user-content',
      title: '6. User-Generated Content',
      content: `You retain ownership of any content you submit to the Service, including resumes, profiles, and other materials. By submitting content, you grant us a non-exclusive, worldwide, royalty-free license to use, modify, and display such content for the purpose of providing the Service.`
    },
    {
      id: 'privacy',
      title: '7. Privacy and Data Protection',
      content: `Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use the Service. By using the Service, you agree to the collection and use of information in accordance with our Privacy Policy.`
    },
    {
      id: 'ai-services',
      title: '8. AI-Powered Services',
      content: `Our AI-powered features provide automated analysis and recommendations. While we strive for accuracy, these services are provided "as is" and should not be considered as professional career advice. We recommend consulting with qualified career professionals for important career decisions.`
    },
    {
      id: 'payment-terms',
      title: '9. Payment Terms',
      content: `Certain features of the Service may require payment. All fees are non-refundable unless otherwise stated. We reserve the right to change our pricing at any time, with notice to existing subscribers. Subscription fees will be charged on a recurring basis until cancelled.`
    },
    {
      id: 'termination',
      title: '10. Termination',
      content: `We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the Service will cease immediately.`
    },
    {
      id: 'disclaimers',
      title: '11. Disclaimers and Limitation of Liability',
      content: `The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, expressed or implied, and hereby disclaim all other warranties. In no event shall CareerBuddy be liable for any indirect, incidental, special, consequential, or punitive damages.`
    },
    {
      id: 'governing-law',
      title: '12. Governing Law',
      content: `These Terms shall be interpreted and governed by the laws of the State of California, without regard to its conflict of law provisions. Any disputes arising from these Terms will be resolved in the courts of California.`
    },
    {
      id: 'changes',
      title: '13. Changes to Terms',
      content: `We reserve the right to modify these Terms at any time. We will notify users of any material changes via email or through the Service. Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.`
    },
    {
      id: 'contact',
      title: '14. Contact Information',
      content: `If you have any questions about these Terms of Service, please contact us at legal@careerbuddy.com or through our contact page.`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-800 relative overflow-hidden">
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
                className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mr-4"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Scale className="h-8 w-8 text-white" />
              </motion.div>
              <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
                Terms of Service
              </h1>
            </div>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-6 font-light">
              Please read these terms carefully before using CareerBuddy.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-300 font-medium">
              <FileText className="h-4 w-4" />
              <span>Last updated: October 3, 2024</span>
            </div>
          </motion.div>

          {/* Important Notice */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-12 backdrop-blur-xl"
          >
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-amber-400 mb-2 tracking-tight">Important Notice</h3>
                <p className="text-gray-200 leading-relaxed font-light">
                  By using CareerBuddy, you agree to these terms. If you disagree with any part of these terms, 
                  you may not access the service. These terms apply to all visitors, users, and others who access or use the service.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Terms Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-all duration-300"
              >
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center tracking-tight">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mr-3" />
                  {section.title}
                </h2>
                <div className="text-gray-200 leading-relaxed whitespace-pre-line font-light">
                  {section.content}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer Actions */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-16 text-center"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 mb-8">
              <div className="flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-green-400 mr-3" />
                <h3 className="text-2xl font-bold text-white tracking-tight">Questions about our Terms?</h3>
              </div>
              <p className="text-gray-200 mb-6 max-w-2xl mx-auto font-light">
                We're here to help clarify any questions you might have about our terms of service. 
                Don't hesitate to reach out to our legal team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                    <Link href="/contact">Contact Legal Team</Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-3 rounded-xl font-semibold" asChild>
                    <Link href="/privacy">View Privacy Policy</Link>
                  </Button>
                </motion.div>
              </div>
            </div>

            <p className="text-gray-300 text-sm font-medium">
              © 2024 CareerBuddy. All rights reserved. These terms are effective as of October 3, 2024.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
