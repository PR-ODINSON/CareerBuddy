'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  CheckCircle,
  GraduationCap
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'Send us an email anytime',
      contact: 'hello@careerbuddy.com',
      action: 'mailto:hello@careerbuddy.com'
    },
    {
      icon: Phone,
      title: 'Call Us',
      description: 'Mon-Fri from 8am to 5pm',
      contact: '+1 (555) 123-4567',
      action: 'tel:+15551234567'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      description: 'Come say hello at our office',
      contact: '123 Innovation Drive, Tech City, TC 12345',
      action: '#'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      description: 'We\'re here to help',
      contact: 'Mon-Fri: 8am-5pm PST',
      action: '#'
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
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto font-light">
              Have questions about CareerBuddy? We're here to help you succeed in your career journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white tracking-tight">Send us a message</CardTitle>
                  <CardDescription className="text-gray-200 font-light">
                    Fill out the form below and we'll get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-semibold text-gray-200 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Your full name"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-semibold text-gray-200 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="category" className="block text-sm font-semibold text-gray-200 mb-2">
                          Category
                        </label>
                        <input
                          type="text"
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="e.g., General Inquiry, Technical Support, etc."
                        />
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-sm font-semibold text-gray-200 mb-2">
                          Subject *
                        </label>
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="What's this about?"
                        />
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-semibold text-gray-200 mb-2">
                          Message *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          required
                          rows={5}
                          value={formData.message}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                          placeholder="Tell us how we can help you..."
                        />
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center justify-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Sending...</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center space-x-2">
                              <Send className="h-4 w-4" />
                              <span>Send Message</span>
                            </div>
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="text-center py-12"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                      >
                        <CheckCircle className="h-8 w-8 text-white" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Message Sent!</h3>
                      <p className="text-gray-200 mb-6 font-light">
                        Thank you for reaching out. We'll get back to you within 24 hours.
                      </p>
                      <Button
                        onClick={() => {
                          setIsSubmitted(false);
                          setFormData({
                            name: '',
                            email: '',
                            subject: '',
                            message: '',
                            category: ''
                          });
                        }}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Send Another Message
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
                  Let's start a conversation
                </h2>
                <p className="text-gray-200 text-lg font-light">
                  We're here to help you succeed. Whether you have questions about our features, 
                  need technical support, or want to explore partnership opportunities, we'd love to hear from you.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={index}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="group"
                  >
                    <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/10">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <motion.div 
                            className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300"
                            whileHover={{ scale: 1.1 }}
                          >
                            <info.icon className="h-6 w-6 text-white" />
                          </motion.div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-1 tracking-tight">
                              {info.title}
                            </h3>
                            <p className="text-gray-200 text-sm mb-2 font-light">
                              {info.description}
                            </p>
                            <a 
                              href={info.action}
                              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                            >
                              {info.contact}
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
