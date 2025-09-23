import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, BarChart3, FileText, BrainCircuit, Target } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: FileText,
      title: 'Smart Resume Builder',
      description: 'Create and optimize your resume with AI-powered suggestions and real-time feedback.',
    },
    {
      icon: BrainCircuit,
      title: 'AI Career Guidance',
      description: 'Get personalized career advice and job recommendations based on your profile.',
    },
    {
      icon: Target,
      title: 'Job Matching',
      description: 'Find the perfect job opportunities that match your skills and preferences.',
    },
    {
      icon: Users,
      title: 'Expert Counselors',
      description: 'Connect with professional career counselors for personalized guidance.',
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking',
      description: 'Monitor your job application progress and career development journey.',
    },
    {
      icon: GraduationCap,
      title: 'Student Focused',
      description: 'Designed specifically for students and new graduates entering the job market.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">CareerBuddy</span>
          </div>
          <div className="space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Your AI-Powered Career Companion
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          CareerBuddy helps students build outstanding resumes, get personalized career guidance, 
          and land their dream jobs with the power of AI and expert counselors.
        </p>
        <div className="space-x-4">
          <Button size="lg" asChild>
            <Link href="/auth/register">Start Your Journey</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/auth/login">Login</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Everything You Need to Succeed
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="bg-blue-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Launch Your Career?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students who have transformed their career prospects with CareerBuddy.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/auth/register">Get Started Free</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2024 CareerBuddy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
