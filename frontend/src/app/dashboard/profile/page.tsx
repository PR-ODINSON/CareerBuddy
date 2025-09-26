'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  BookOpen,
  Calendar,
  Award,
  Edit,
  Save,
  Camera,
  Plus,
  X,
  Star,
  Briefcase,
  Link as LinkIcon,
  Github,
  Linkedin,
  Globe
} from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    bio: 'Passionate software developer with a keen interest in modern web technologies and user experience design.',
    university: user?.university || '',
    major: user?.major || '',
    graduationYear: user?.graduationYear || new Date().getFullYear(),
    currentYear: user?.currentYear || '',
    gpa: user?.gpa || '',
    skills: ['React', 'TypeScript', 'Node.js', 'Python', 'SQL', 'AWS'],
    experience: [
      {
        id: 1,
        title: 'Software Engineer Intern',
        company: 'TechCorp',
        duration: 'Jun 2023 - Aug 2023',
        description: 'Developed and maintained web applications using React and Node.js'
      }
    ],
    projects: [
      {
        id: 1,
        name: 'E-commerce Platform',
        description: 'Full-stack e-commerce application built with React, Node.js, and MongoDB',
        technologies: ['React', 'Node.js', 'MongoDB'],
        link: 'https://github.com/user/ecommerce'
      }
    ],
    links: {
      github: 'https://github.com/johndoe',
      linkedin: 'https://linkedin.com/in/johndoe',
      portfolio: 'https://johndoe.dev'
    }
  });

  const [newSkill, setNewSkill] = useState('');

  const handleSave = () => {
    // Save profile data
    setIsEditing(false);
    // TODO: API call to save data
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
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
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">Manage your personal information and career details</p>
          </div>
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                      {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
                    </div>
                    {isEditing && (
                      <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50">
                        <Camera className="h-4 w-4 text-gray-600" />
                      </button>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {profileData.firstName} {profileData.lastName}
                  </h2>
                  <p className="text-gray-600 mt-1">{profileData.major} Student</p>
                  <p className="text-gray-500 text-sm mt-1">{profileData.location}</p>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">{profileData.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">{profileData.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <GraduationCap className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">{profileData.university}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Social Links</h3>
                  <div className="space-y-2">
                    <a href={profileData.links.github} className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900">
                      <Github className="h-4 w-4" />
                      <span>GitHub</span>
                    </a>
                    <a href={profileData.links.linkedin} className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900">
                      <Linkedin className="h-4 w-4" />
                      <span>LinkedIn</span>
                    </a>
                    <a href={profileData.links.portfolio} className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900">
                      <Globe className="h-4 w-4" />
                      <span>Portfolio</span>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="university">University</Label>
                    <Input
                      id="university"
                      value={profileData.university}
                      onChange={(e) => setProfileData(prev => ({ ...prev, university: e.target.value }))}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="major">Major</Label>
                    <Input
                      id="major"
                      value={profileData.major}
                      onChange={(e) => setProfileData(prev => ({ ...prev, major: e.target.value }))}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="currentYear">Current Year</Label>
                    <Select value={profileData.currentYear} onValueChange={(value) => setProfileData(prev => ({ ...prev, currentYear: value }))} disabled={!isEditing}>
                      <SelectTrigger className="mt-1">
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
                  </div>
                  <div>
                    <Label htmlFor="graduationYear">Graduation Year</Label>
                    <Input
                      id="graduationYear"
                      type="number"
                      value={profileData.graduationYear}
                      onChange={(e) => setProfileData(prev => ({ ...prev, graduationYear: parseInt(e.target.value) }))}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gpa">GPA (Optional)</Label>
                    <Input
                      id="gpa"
                      type="number"
                      step="0.01"
                      max="4.0"
                      value={profileData.gpa}
                      onChange={(e) => setProfileData(prev => ({ ...prev, gpa: parseFloat(e.target.value) }))}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {profileData.skills.map((skill, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200"
                    >
                      <span className="text-sm font-medium">{skill}</span>
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a skill..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                      className="flex-1"
                    />
                    <Button onClick={handleAddSkill} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData.experience.map((exp, index) => (
                  <div key={exp.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                        <p className="text-blue-600 font-medium">{exp.company}</p>
                        <p className="text-sm text-gray-500">{exp.duration}</p>
                        <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                      </div>
                      {isEditing && (
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {isEditing && (
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
