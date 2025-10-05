import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserSchema } from '../src/users/schemas/user.schema';
import { Job, JobSchema } from '../src/jobs/schemas/job.schema';
import { CounselorAssignment, CounselorAssignmentSchema } from '../src/common/schemas/counselor-assignment.schema';

async function connectToDatabase() {
  const mongoUrl = process.env.MONGODB_URL || 
    'mongodb+srv://prithraj120_db_user:2hp6v5DySDDwG0Vn@cluster0.ih61mql.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  
  await mongoose.connect(mongoUrl);
  console.log('Connected to MongoDB');

  // Register schemas if not already registered
  if (!mongoose.models.User) {
    mongoose.model('User', UserSchema);
  }
  if (!mongoose.models.Job) {
    mongoose.model('Job', JobSchema);
  }
  if (!mongoose.models.CounselorAssignment) {
    mongoose.model('CounselorAssignment', CounselorAssignmentSchema);
  }
}

async function main() {
  await connectToDatabase();
  console.log('Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminData = {
    email: 'admin@careerbuddy.com',
    password: adminPassword,
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
    isVerified: true,
    isActive: true,
  };

  const existingAdmin = await mongoose.model('User').findOne({ email: adminData.email });
  let admin;
  if (existingAdmin) {
    admin = await mongoose.model('User').findByIdAndUpdate(existingAdmin._id, adminData, { new: true });
  } else {
    admin = await mongoose.model('User').create(adminData);
  }

  // Create counselor user
  const counselorPassword = await bcrypt.hash('counselor123', 10);
  const counselorData = {
    email: 'counselor@careerbuddy.com',
    password: counselorPassword,
    firstName: 'Jane',
    lastName: 'Smith',
    role: UserRole.COUNSELOR,
    isVerified: true,
    isActive: true,
    specialization: ['Software Engineering', 'Data Science', 'Career Development'],
    experience: 5,
    certification: 'Certified Career Counselor (CCC)',
    rating: 4.8,
    bio: 'Experienced career counselor specializing in technology careers and professional development.',
  };

  const existingCounselor = await mongoose.model('User').findOne({ email: counselorData.email });
  let counselor;
  if (existingCounselor) {
    counselor = await mongoose.model('User').findByIdAndUpdate(existingCounselor._id, counselorData, { new: true });
  } else {
    counselor = await mongoose.model('User').create(counselorData);
  }

  // Create additional counselor user
  const counselor2Password = await bcrypt.hash('counselor123', 10);
  const counselor2Data = {
    email: 'sarah.counselor@careerbuddy.com',
    password: counselor2Password,
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: UserRole.COUNSELOR,
    isVerified: true,
    isActive: true,
    specialization: ['Business Development', 'Marketing', 'Leadership'],
    experience: 8,
    certification: 'Professional Certified Coach (PCC)',
    rating: 4.9,
    bio: 'Senior career counselor with expertise in business careers and executive coaching.',
  };

  const existingCounselor2 = await mongoose.model('User').findOne({ email: counselor2Data.email });
  let counselor2;
  if (existingCounselor2) {
    counselor2 = await mongoose.model('User').findByIdAndUpdate(existingCounselor2._id, counselor2Data, { new: true });
  } else {
    counselor2 = await mongoose.model('User').create(counselor2Data);
  }

  // Create student user
  const studentPassword = await bcrypt.hash('student123', 10);
  const studentData = {
    email: 'student@careerbuddy.com',
    password: studentPassword,
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.STUDENT,
    isVerified: true,
    isActive: true,
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
  };

  const existingStudent = await mongoose.model('User').findOne({ email: studentData.email });
  let student;
  if (existingStudent) {
    student = await mongoose.model('User').findByIdAndUpdate(existingStudent._id, studentData, { new: true });
  } else {
    student = await mongoose.model('User').create(studentData);
  }

  // Create additional students
  const student2Password = await bcrypt.hash('student123', 10);
  const student2Data = {
    email: 'emily.student@careerbuddy.com',
    password: student2Password,
    firstName: 'Emily',
    lastName: 'Chen',
    role: UserRole.STUDENT,
    isVerified: true,
    isActive: true,
    university: 'State University',
    major: 'Data Science',
    graduationYear: 2025,
    gpa: 3.9,
    linkedinUrl: 'https://linkedin.com/in/emilychen',
    githubUrl: 'https://github.com/emilychen',
    targetRoles: ['Data Scientist', 'Machine Learning Engineer'],
    preferredIndustries: ['Technology', 'Healthcare', 'Finance'],
    locationPreferences: ['Remote', 'Boston', 'Seattle'],
    salaryExpectation: 95000,
  };

  const existingStudent2 = await mongoose.model('User').findOne({ email: student2Data.email });
  let student2;
  if (existingStudent2) {
    student2 = await mongoose.model('User').findByIdAndUpdate(existingStudent2._id, student2Data, { new: true });
  } else {
    student2 = await mongoose.model('User').create(student2Data);
  }

  // Create sample jobs
  const JobModel = mongoose.model('Job');
  const sampleJobs = [
    {
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      description: 'We are looking for a skilled Frontend Developer to join our innovative team. You will be responsible for developing user-friendly web applications using modern frameworks and technologies.',
      requirements: ['React', 'TypeScript', '3+ years experience', 'CSS/SASS', 'REST APIs'],
      location: 'New York, NY',
      locationType: 'HYBRID',
      salaryMin: 80000,
      salaryMax: 120000,
      experienceLevel: 'MID',
      skills: ['React', 'TypeScript', 'CSS', 'JavaScript', 'Redux'],
      benefits: ['Health Insurance', '401k', 'Remote Work', 'Stock Options'],
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },
    {
      title: 'Backend Engineer',
      company: 'StartupXYZ',
      description: 'Join our growing team as a Backend Engineer. You will design and implement scalable server-side applications and APIs.',
      requirements: ['Node.js', 'MongoDB', 'REST APIs', 'Docker', '2+ years experience'],
      location: 'San Francisco, CA',
      locationType: 'ONSITE',
      salaryMin: 90000,
      salaryMax: 140000,
      experienceLevel: 'JUNIOR',
      skills: ['Node.js', 'MongoDB', 'Express.js', 'TypeScript', 'AWS'],
      benefits: ['Stock Options', 'Flexible Hours', 'Learning Budget', 'Free Meals'],
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },
    {
      title: 'Data Science Intern',
      company: 'DataCorp Analytics',
      description: 'Summer internship opportunity for aspiring data scientists. Work on real projects involving machine learning and data analysis.',
      requirements: ['Python', 'Statistics', 'Machine Learning', 'SQL', 'Currently pursuing degree'],
      location: 'Remote',
      locationType: 'REMOTE',
      salaryMin: 25,
      salaryMax: 35,
      experienceLevel: 'ENTRY',
      skills: ['Python', 'Pandas', 'Machine Learning', 'SQL', 'Jupyter'],
      benefits: ['Mentorship', 'Training', 'Networking', 'Certification'],
      employmentType: 'INTERNSHIP',
      isActive: true,
      createdBy: admin._id,
    },
    {
      title: 'Full Stack Developer',
      company: 'InnovateTech Solutions',
      description: 'Looking for a versatile Full Stack Developer to work on cutting-edge web applications from front-end to back-end.',
      requirements: ['React', 'Node.js', 'MongoDB', '2+ years experience', 'Git'],
      location: 'Austin, TX',
      locationType: 'HYBRID',
      salaryMin: 75000,
      salaryMax: 110000,
      experienceLevel: 'MID',
      skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'Express.js'],
      benefits: ['Health Insurance', 'PTO', 'Professional Development', 'Team Events'],
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },
  ];

  for (const jobData of sampleJobs) {
    const existingJob = await JobModel.findOne({ title: jobData.title, company: jobData.company });
    if (!existingJob) {
      await JobModel.create(jobData);
    }
  }

  // Create counselor assignments
  const AssignmentModel = mongoose.model('CounselorAssignment');
  
  // Assign student to counselor
  const assignment1 = await AssignmentModel.findOne({ counselorId: counselor._id, studentId: student._id });
  if (!assignment1) {
    await AssignmentModel.create({
      counselorId: counselor._id,
      studentId: student._id,
      notes: 'Initial assignment for CS student - focus on software engineering career path',
    });
  }

  // Assign student2 to counselor2
  const assignment2 = await AssignmentModel.findOne({ counselorId: counselor2._id, studentId: student2._id });
  if (!assignment2) {
    await AssignmentModel.create({
      counselorId: counselor2._id,
      studentId: student2._id,
      notes: 'Initial assignment for Data Science student - focus on analytics and ML roles',
    });
  }

  console.log('Database seeded successfully!');
  console.log({
    admin: { email: admin.email, id: admin._id },
    counselor: { email: counselor.email, id: counselor._id },
    counselor2: { email: counselor2.email, id: counselor2._id },
    student: { email: student.email, id: student._id },
    student2: { email: student2.email, id: student2._id },
  });
  console.log('\n=== LOGIN CREDENTIALS ===');
  console.log('Admin: admin@careerbuddy.com / admin123');
  console.log('Counselor 1: counselor@careerbuddy.com / counselor123');
  console.log('Counselor 2: sarah.counselor@careerbuddy.com / counselor123');
  console.log('Student 1: student@careerbuddy.com / student123');
  console.log('Student 2: emily.student@careerbuddy.com / student123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
