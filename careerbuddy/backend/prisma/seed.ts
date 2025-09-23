import { PrismaClient, UserRole, SkillCategory } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@careerbuddy.com' },
    update: {},
    create: {
      email: 'admin@careerbuddy.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isVerified: true,
    },
  });

  // Create counselor user
  const counselorPassword = await bcrypt.hash('counselor123', 10);
  const counselor = await prisma.user.upsert({
    where: { email: 'counselor@careerbuddy.com' },
    update: {},
    create: {
      email: 'counselor@careerbuddy.com',
      password: counselorPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      role: UserRole.COUNSELOR,
      isVerified: true,
      counselorProfile: {
        create: {
          specialization: ['Software Engineering', 'Data Science'],
          experience: 5,
          certification: 'Certified Career Counselor',
          rating: 4.8,
        },
      },
    },
  });

  // Create student user
  const studentPassword = await bcrypt.hash('student123', 10);
  const student = await prisma.user.upsert({
    where: { email: 'student@careerbuddy.com' },
    update: {},
    create: {
      email: 'student@careerbuddy.com',
      password: studentPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.STUDENT,
      isVerified: true,
      studentProfile: {
        create: {
          university: 'University of Technology',
          major: 'Computer Science',
          graduationYear: 2024,
          gpa: 3.7,
          linkedinUrl: 'https://linkedin.com/in/johndoe',
          githubUrl: 'https://github.com/johndoe',
          targetRoles: ['Software Engineer', 'Full Stack Developer'],
          preferredIndustries: ['Technology', 'Fintech'],
          locationPreferences: ['Remote', 'New York', 'San Francisco'],
          salaryExpectation: 85000,
        },
      },
    },
  });

  // Create common skills
  const skills = [
    // Technical skills
    { name: 'JavaScript', category: SkillCategory.TECHNICAL },
    { name: 'TypeScript', category: SkillCategory.TECHNICAL },
    { name: 'React', category: SkillCategory.TECHNICAL },
    { name: 'Node.js', category: SkillCategory.TECHNICAL },
    { name: 'Python', category: SkillCategory.TECHNICAL },
    { name: 'Java', category: SkillCategory.TECHNICAL },
    { name: 'SQL', category: SkillCategory.TECHNICAL },
    { name: 'PostgreSQL', category: SkillCategory.TECHNICAL },
    { name: 'MongoDB', category: SkillCategory.TECHNICAL },
    { name: 'AWS', category: SkillCategory.TOOL },
    { name: 'Docker', category: SkillCategory.TOOL },
    { name: 'Git', category: SkillCategory.TOOL },
    
    // Soft skills
    { name: 'Communication', category: SkillCategory.SOFT },
    { name: 'Leadership', category: SkillCategory.SOFT },
    { name: 'Problem Solving', category: SkillCategory.SOFT },
    { name: 'Teamwork', category: SkillCategory.SOFT },
    { name: 'Project Management', category: SkillCategory.SOFT },
    
    // Languages
    { name: 'English', category: SkillCategory.LANGUAGE },
    { name: 'Spanish', category: SkillCategory.LANGUAGE },
    { name: 'French', category: SkillCategory.LANGUAGE },
  ];

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: skill,
    });
  }

  // Create sample jobs
  const sampleJobs = [
    {
      title: 'Frontend Developer',
      company: 'TechCorp Inc.',
      description: 'We are looking for a skilled Frontend Developer to join our team...',
      requirements: ['React', 'TypeScript', '3+ years experience'],
      location: 'New York, NY',
      locationType: 'HYBRID' as const,
      salaryMin: 80000,
      salaryMax: 120000,
      experienceLevel: 'MID' as const,
      skills: ['React', 'TypeScript', 'CSS', 'JavaScript'],
      benefits: ['Health Insurance', '401k', 'Remote Work'],
      employmentType: 'FULL_TIME' as const,
      createdBy: admin.id,
    },
    {
      title: 'Backend Engineer',
      company: 'StartupXYZ',
      description: 'Join our growing team as a Backend Engineer...',
      requirements: ['Node.js', 'PostgreSQL', 'REST APIs'],
      location: 'San Francisco, CA',
      locationType: 'ONSITE' as const,
      salaryMin: 90000,
      salaryMax: 140000,
      experienceLevel: 'JUNIOR' as const,
      skills: ['Node.js', 'PostgreSQL', 'Express.js', 'TypeScript'],
      benefits: ['Stock Options', 'Flexible Hours', 'Learning Budget'],
      employmentType: 'FULL_TIME' as const,
      createdBy: admin.id,
    },
    {
      title: 'Data Science Intern',
      company: 'DataCorp',
      description: 'Summer internship opportunity for aspiring data scientists...',
      requirements: ['Python', 'Statistics', 'Machine Learning'],
      location: 'Remote',
      locationType: 'REMOTE' as const,
      salaryMin: 25,
      salaryMax: 35,
      experienceLevel: 'ENTRY' as const,
      skills: ['Python', 'Pandas', 'Machine Learning', 'SQL'],
      benefits: ['Mentorship', 'Training', 'Networking'],
      employmentType: 'INTERNSHIP' as const,
      createdBy: admin.id,
    },
  ];

  for (const job of sampleJobs) {
    await prisma.job.create({
      data: job,
    });
  }

  console.log('Database seeded successfully!');
  console.log({
    admin: { email: admin.email, id: admin.id },
    counselor: { email: counselor.email, id: counselor.id },
    student: { email: student.email, id: student.id },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
