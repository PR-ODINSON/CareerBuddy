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

  // Create comprehensive Indian company jobs
  const JobModel = mongoose.model('Job');
  const indianJobs = [
    // TCS Jobs
    {
      title: 'Software Engineer - Full Stack',
      company: 'Tata Consultancy Services (TCS)',
      description: 'Join TCS as a Full Stack Developer to work on enterprise-level applications. You will be part of digital transformation projects for global clients, working with cutting-edge technologies and methodologies.',
      requirements: ['B.Tech/B.E in Computer Science or related field', '0-2 years experience', 'Strong programming skills in Java/Python', 'Knowledge of web technologies', 'Good communication skills'],
      location: 'Bangalore, Karnataka',
      locationType: 'HYBRID',
      salaryMin: 350000,
      salaryMax: 600000,
      experienceLevel: 'ENTRY',
      skills: ['Java', 'Spring Boot', 'React', 'MySQL', 'REST APIs', 'Git'],
      benefits: ['Health Insurance', 'Life Insurance', 'Provident Fund', 'Training & Development', 'Work from Home'],
      department: 'Technology',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },
    {
      title: 'Senior Data Scientist',
      company: 'Tata Consultancy Services (TCS)',
      description: 'Lead data science initiatives and build ML models for enterprise clients. Work on AI/ML projects across various domains including healthcare, finance, and retail.',
      requirements: ['M.Tech/MS in Data Science/Statistics/Computer Science', '3-5 years experience in ML/AI', 'Proficiency in Python/R', 'Experience with cloud platforms', 'Strong analytical skills'],
      location: 'Hyderabad, Telangana',
      locationType: 'ONSITE',
      salaryMin: 1200000,
      salaryMax: 2000000,
      experienceLevel: 'SENIOR',
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'AWS', 'SQL', 'Statistics'],
      benefits: ['Health Insurance', 'Stock Options', 'Flexible Hours', 'International Projects', 'Certification Programs'],
      department: 'Data & Analytics',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // Infosys Jobs
    {
      title: 'Systems Engineer',
      company: 'Infosys Limited',
      description: 'Start your career with Infosys as a Systems Engineer. You will undergo comprehensive training and work on diverse technology projects for global clients.',
      requirements: ['B.E/B.Tech in any discipline', 'Fresh graduate or 0-1 year experience', 'Strong logical and analytical skills', 'Good English communication', 'Willingness to learn new technologies'],
      location: 'Pune, Maharashtra',
      locationType: 'ONSITE',
      salaryMin: 380000,
      salaryMax: 450000,
      experienceLevel: 'ENTRY',
      skills: ['Programming Fundamentals', 'Database Concepts', 'Web Technologies', 'Problem Solving'],
      benefits: ['Comprehensive Training', 'Health Insurance', 'Transport Facility', 'Career Growth', 'Global Exposure'],
      department: 'Technology',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },
    {
      title: 'Technology Lead - Cloud Architecture',
      company: 'Infosys Limited',
      description: 'Lead cloud transformation initiatives and architect scalable solutions. Drive technical excellence and mentor junior developers in cloud-native development.',
      requirements: ['B.Tech + 6-8 years experience', 'Expertise in AWS/Azure/GCP', 'Strong in microservices architecture', 'Leadership experience', 'Cloud certifications preferred'],
      location: 'Bangalore, Karnataka',
      locationType: 'HYBRID',
      salaryMin: 1800000,
      salaryMax: 2800000,
      experienceLevel: 'LEAD',
      skills: ['AWS', 'Kubernetes', 'Docker', 'Microservices', 'DevOps', 'Team Leadership'],
      benefits: ['Stock Options', 'Health Insurance', 'Flexible Work', 'Learning Budget', 'International Assignments'],
      department: 'Cloud & Infrastructure',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // Wipro Jobs
    {
      title: 'Project Engineer - Java Development',
      company: 'Wipro Technologies',
      description: 'Work on enterprise Java applications and contribute to large-scale software development projects. Collaborate with cross-functional teams to deliver high-quality solutions.',
      requirements: ['B.E/B.Tech in Computer Science', '1-3 years Java development experience', 'Knowledge of Spring framework', 'Database skills', 'Agile methodology experience'],
      location: 'Chennai, Tamil Nadu',
      locationType: 'ONSITE',
      salaryMin: 450000,
      salaryMax: 700000,
      experienceLevel: 'JUNIOR',
      skills: ['Java', 'Spring Boot', 'Hibernate', 'MySQL', 'REST APIs', 'JUnit'],
      benefits: ['Health Insurance', 'Skill Development', 'Performance Bonus', 'Flexible Hours', 'Employee Assistance Program'],
      department: 'Application Development',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },
    {
      title: 'Senior Consultant - Cybersecurity',
      company: 'Wipro Technologies',
      description: 'Lead cybersecurity initiatives and implement security frameworks for enterprise clients. Conduct security assessments and provide strategic security guidance.',
      requirements: ['B.Tech + 4-6 years cybersecurity experience', 'CISSP/CEH/CISM certifications', 'Knowledge of security frameworks', 'Risk assessment experience', 'Client-facing skills'],
      location: 'Gurgaon, Haryana',
      locationType: 'HYBRID',
      salaryMin: 1400000,
      salaryMax: 2200000,
      experienceLevel: 'SENIOR',
      skills: ['Cybersecurity', 'Risk Management', 'Penetration Testing', 'SIEM', 'Compliance', 'Security Architecture'],
      benefits: ['Health Insurance', 'Stock Options', 'Certification Support', 'Global Projects', 'Work-Life Balance'],
      department: 'Cybersecurity',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // HCL Technologies Jobs
    {
      title: 'Software Developer - Frontend',
      company: 'HCL Technologies',
      description: 'Develop responsive and interactive user interfaces using modern frontend technologies. Work closely with UX/UI designers to create exceptional user experiences.',
      requirements: ['B.Tech in Computer Science', '1-2 years frontend experience', 'Proficiency in React/Angular', 'CSS and JavaScript expertise', 'Version control knowledge'],
      location: 'Noida, Uttar Pradesh',
      locationType: 'HYBRID',
      salaryMin: 400000,
      salaryMax: 650000,
      experienceLevel: 'JUNIOR',
      skills: ['React', 'JavaScript', 'CSS3', 'HTML5', 'Redux', 'Webpack'],
      benefits: ['Health Insurance', 'Skill Enhancement', 'Flexible Timing', 'Team Outings', 'Performance Incentives'],
      department: 'Digital Solutions',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },
    {
      title: 'Principal Architect - Enterprise Solutions',
      company: 'HCL Technologies',
      description: 'Define technical strategy and architecture for large-scale enterprise solutions. Lead architectural decisions and guide development teams across multiple projects.',
      requirements: ['M.Tech/B.Tech + 8-12 years experience', 'Enterprise architecture experience', 'Strong in multiple technology stacks', 'Leadership and mentoring skills', 'Client engagement experience'],
      location: 'Mumbai, Maharashtra',
      locationType: 'HYBRID',
      salaryMin: 2500000,
      salaryMax: 4000000,
      experienceLevel: 'EXECUTIVE',
      skills: ['Enterprise Architecture', 'System Design', 'Multiple Tech Stacks', 'Leadership', 'Strategic Planning'],
      benefits: ['Stock Options', 'Executive Health Plan', 'Flexible Work', 'Global Travel', 'Leadership Development'],
      department: 'Architecture & Design',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // Tech Mahindra Jobs
    {
      title: 'Associate Software Engineer',
      company: 'Tech Mahindra',
      description: 'Begin your career in software development with comprehensive training and hands-on project experience. Work on innovative solutions for telecommunications and technology clients.',
      requirements: ['B.E/B.Tech in any stream', 'Fresh graduate', 'Strong problem-solving skills', 'Basic programming knowledge', 'Good communication skills'],
      location: 'Bangalore, Karnataka',
      locationType: 'ONSITE',
      salaryMin: 350000,
      salaryMax: 420000,
      experienceLevel: 'ENTRY',
      skills: ['Programming Basics', 'Database Fundamentals', 'Web Development', 'Problem Solving'],
      benefits: ['Comprehensive Training', 'Health Insurance', 'Career Development', 'Transport', 'Meal Vouchers'],
      department: 'Software Development',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },
    {
      title: 'Senior Manager - Digital Transformation',
      company: 'Tech Mahindra',
      description: 'Lead digital transformation initiatives for enterprise clients. Drive innovation and implement cutting-edge technologies to solve complex business challenges.',
      requirements: ['MBA/M.Tech + 6-8 years experience', 'Digital transformation expertise', 'Strong business acumen', 'Client management skills', 'Technology leadership'],
      location: 'Pune, Maharashtra',
      locationType: 'HYBRID',
      salaryMin: 2000000,
      salaryMax: 3200000,
      experienceLevel: 'SENIOR',
      skills: ['Digital Strategy', 'Business Analysis', 'Technology Leadership', 'Client Management', 'Innovation'],
      benefits: ['Stock Options', 'Health Insurance', 'Global Exposure', 'Leadership Training', 'Performance Bonus'],
      department: 'Digital Transformation',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // Accenture India Jobs
    {
      title: 'Application Development Analyst',
      company: 'Accenture India',
      description: 'Develop and maintain enterprise applications using latest technologies. Collaborate with global teams to deliver innovative solutions for Fortune 500 clients.',
      requirements: ['B.E/B.Tech in Computer Science', '2-4 years development experience', 'Strong in Java/.NET', 'Database knowledge', 'Agile experience'],
      location: 'Hyderabad, Telangana',
      locationType: 'HYBRID',
      salaryMin: 600000,
      salaryMax: 900000,
      experienceLevel: 'MID',
      skills: ['Java', '.NET', 'SQL Server', 'Angular', 'REST APIs', 'Agile'],
      benefits: ['Health Insurance', 'Global Projects', 'Skill Development', 'Flexible Work', 'Performance Bonus'],
      department: 'Application Services',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },
    {
      title: 'Managing Director - Technology',
      company: 'Accenture India',
      description: 'Lead technology strategy and operations for key client accounts. Drive business growth and innovation while managing large technology teams.',
      requirements: ['MBA + 12-15 years experience', 'Technology leadership experience', 'P&L responsibility', 'Client relationship management', 'Strategic thinking'],
      location: 'Mumbai, Maharashtra',
      locationType: 'HYBRID',
      salaryMin: 4000000,
      salaryMax: 7000000,
      experienceLevel: 'EXECUTIVE',
      skills: ['Strategic Leadership', 'P&L Management', 'Client Relations', 'Technology Strategy', 'Team Management'],
      benefits: ['Stock Options', 'Executive Benefits', 'Global Travel', 'Leadership Development', 'Flexible Work'],
      department: 'Executive Leadership',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // Capgemini India Jobs
    {
      title: 'Software Engineer - DevOps',
      company: 'Capgemini India',
      description: 'Implement and maintain CI/CD pipelines, automate deployment processes, and ensure smooth software delivery. Work with containerization and cloud technologies.',
      requirements: ['B.Tech in Computer Science', '1-3 years DevOps experience', 'Knowledge of Docker/Kubernetes', 'CI/CD tools experience', 'Cloud platform knowledge'],
      location: 'Bangalore, Karnataka',
      locationType: 'HYBRID',
      salaryMin: 500000,
      salaryMax: 800000,
      experienceLevel: 'JUNIOR',
      skills: ['Docker', 'Kubernetes', 'Jenkins', 'AWS', 'Terraform', 'Git'],
      benefits: ['Health Insurance', 'Skill Certification', 'Flexible Hours', 'Global Exposure', 'Career Growth'],
      department: 'DevOps & Cloud',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // Indian Startups - Flipkart
    {
      title: 'Senior Software Development Engineer',
      company: 'Flipkart',
      description: 'Build and scale e-commerce platform serving millions of users. Work on high-performance systems, microservices architecture, and innovative features.',
      requirements: ['B.Tech/M.Tech in Computer Science', '3-5 years experience', 'Strong in Java/Python/Go', 'System design knowledge', 'Experience with distributed systems'],
      location: 'Bangalore, Karnataka',
      locationType: 'ONSITE',
      salaryMin: 1500000,
      salaryMax: 2500000,
      experienceLevel: 'SENIOR',
      skills: ['Java', 'Microservices', 'System Design', 'Kafka', 'Redis', 'MySQL'],
      benefits: ['Stock Options', 'Health Insurance', 'Flexible Hours', 'Learning Budget', 'Free Meals'],
      department: 'Engineering',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },
    {
      title: 'Product Manager - Mobile',
      company: 'Flipkart',
      description: 'Drive product strategy and roadmap for mobile applications. Work closely with engineering, design, and business teams to deliver exceptional user experiences.',
      requirements: ['MBA/B.Tech + 4-6 years product experience', 'Mobile product experience', 'Strong analytical skills', 'User-centric approach', 'Cross-functional collaboration'],
      location: 'Bangalore, Karnataka',
      locationType: 'ONSITE',
      salaryMin: 1800000,
      salaryMax: 3000000,
      experienceLevel: 'SENIOR',
      skills: ['Product Management', 'Mobile Strategy', 'Analytics', 'User Research', 'Agile'],
      benefits: ['Stock Options', 'Health Insurance', 'Flexible Work', 'Learning Opportunities', 'Team Events'],
      department: 'Product',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // Paytm Jobs
    {
      title: 'Backend Developer - Fintech',
      company: 'Paytm',
      description: 'Develop robust and secure backend systems for financial services. Work on payment processing, wallet systems, and banking integrations.',
      requirements: ['B.Tech in Computer Science', '2-4 years backend experience', 'Strong in Java/Node.js', 'Database expertise', 'Understanding of financial systems'],
      location: 'Noida, Uttar Pradesh',
      locationType: 'ONSITE',
      salaryMin: 800000,
      salaryMax: 1400000,
      experienceLevel: 'MID',
      skills: ['Java', 'Spring Boot', 'MySQL', 'Redis', 'Microservices', 'Payment Systems'],
      benefits: ['Stock Options', 'Health Insurance', 'Performance Bonus', 'Skill Development', 'Free Meals'],
      department: 'Engineering',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // Zomato Jobs
    {
      title: 'Full Stack Developer',
      company: 'Zomato',
      description: 'Build end-to-end features for food delivery platform. Work on both frontend and backend technologies to create seamless user experiences.',
      requirements: ['B.Tech/B.E in Computer Science', '2-3 years full stack experience', 'React and Node.js expertise', 'Database knowledge', 'API development experience'],
      location: 'Gurgaon, Haryana',
      locationType: 'HYBRID',
      salaryMin: 900000,
      salaryMax: 1600000,
      experienceLevel: 'MID',
      skills: ['React', 'Node.js', 'MongoDB', 'Express.js', 'REST APIs', 'JavaScript'],
      benefits: ['Stock Options', 'Health Insurance', 'Food Allowance', 'Flexible Hours', 'Team Outings'],
      department: 'Engineering',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // Swiggy Jobs
    {
      title: 'Data Engineer',
      company: 'Swiggy',
      description: 'Build and maintain data pipelines for analytics and machine learning. Work with large-scale data processing and real-time streaming systems.',
      requirements: ['B.Tech/M.Tech in Computer Science', '2-4 years data engineering experience', 'Strong in Python/Scala', 'Big data technologies', 'Cloud platform experience'],
      location: 'Bangalore, Karnataka',
      locationType: 'ONSITE',
      salaryMin: 1000000,
      salaryMax: 1800000,
      experienceLevel: 'MID',
      skills: ['Python', 'Apache Spark', 'Kafka', 'AWS', 'SQL', 'ETL'],
      benefits: ['Stock Options', 'Health Insurance', 'Learning Budget', 'Flexible Work', 'Food Credits'],
      department: 'Data Engineering',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // BYJU'S Jobs
    {
      title: 'Software Engineer - EdTech',
      company: "BYJU'S",
      description: 'Develop educational technology solutions that impact millions of students. Work on mobile apps, web platforms, and learning management systems.',
      requirements: ['B.Tech in Computer Science', '1-3 years experience', 'Mobile/Web development skills', 'Passion for education', 'Strong problem-solving abilities'],
      location: 'Bangalore, Karnataka',
      locationType: 'ONSITE',
      salaryMin: 600000,
      salaryMax: 1000000,
      experienceLevel: 'JUNIOR',
      skills: ['React Native', 'React', 'Node.js', 'MongoDB', 'Mobile Development'],
      benefits: ['Health Insurance', 'Learning Opportunities', 'Impact-driven Work', 'Skill Development', 'Team Events'],
      department: 'Product Engineering',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // Ola Jobs
    {
      title: 'Senior Data Scientist - Mobility',
      company: 'Ola',
      description: 'Apply machine learning to solve mobility challenges. Work on demand forecasting, route optimization, and pricing algorithms.',
      requirements: ['M.Tech/PhD in Data Science/Statistics', '3-5 years ML experience', 'Strong in Python/R', 'Experience with large datasets', 'Transportation domain knowledge preferred'],
      location: 'Bangalore, Karnataka',
      locationType: 'ONSITE',
      salaryMin: 1400000,
      salaryMax: 2200000,
      experienceLevel: 'SENIOR',
      skills: ['Machine Learning', 'Python', 'TensorFlow', 'SQL', 'Statistics', 'Deep Learning'],
      benefits: ['Stock Options', 'Health Insurance', 'Cab Allowance', 'Learning Budget', 'Flexible Hours'],
      department: 'Data Science',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // PhonePe Jobs
    {
      title: 'Backend Engineer - Payments',
      company: 'PhonePe',
      description: 'Build scalable and secure payment systems handling millions of transactions. Work on core payment infrastructure and financial services.',
      requirements: ['B.Tech/M.Tech in Computer Science', '2-4 years backend experience', 'Strong in Java/Kotlin', 'Microservices architecture', 'Payment systems knowledge'],
      location: 'Bangalore, Karnataka',
      locationType: 'ONSITE',
      salaryMin: 1200000,
      salaryMax: 2000000,
      experienceLevel: 'MID',
      skills: ['Java', 'Spring Boot', 'Microservices', 'Kafka', 'Redis', 'Payment Systems'],
      benefits: ['Stock Options', 'Health Insurance', 'Performance Bonus', 'Learning Budget', 'Free Meals'],
      department: 'Engineering',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // Freshworks Jobs
    {
      title: 'Frontend Developer - SaaS',
      company: 'Freshworks',
      description: 'Build intuitive user interfaces for SaaS products used by businesses worldwide. Work on modern frontend technologies and design systems.',
      requirements: ['B.Tech in Computer Science', '2-3 years frontend experience', 'React/Vue.js expertise', 'CSS and JavaScript proficiency', 'SaaS product experience preferred'],
      location: 'Chennai, Tamil Nadu',
      locationType: 'HYBRID',
      salaryMin: 700000,
      salaryMax: 1200000,
      experienceLevel: 'MID',
      skills: ['React', 'Vue.js', 'JavaScript', 'CSS3', 'Webpack', 'REST APIs'],
      benefits: ['Stock Options', 'Health Insurance', 'Flexible Work', 'Learning Budget', 'Global Exposure'],
      department: 'Product Engineering',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // Razorpay Jobs
    {
      title: 'Software Engineer - Fintech Infrastructure',
      company: 'Razorpay',
      description: 'Build payment infrastructure that powers businesses across India. Work on high-performance systems, APIs, and financial technology solutions.',
      requirements: ['B.Tech/B.E in Computer Science', '1-3 years experience', 'Strong programming skills', 'System design understanding', 'Interest in fintech'],
      location: 'Bangalore, Karnataka',
      locationType: 'ONSITE',
      salaryMin: 800000,
      salaryMax: 1400000,
      experienceLevel: 'JUNIOR',
      skills: ['Java', 'Python', 'MySQL', 'Redis', 'Microservices', 'API Development'],
      benefits: ['Stock Options', 'Health Insurance', 'Learning Budget', 'Flexible Hours', 'Team Events'],
      department: 'Engineering',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // Myntra Jobs
    {
      title: 'Mobile App Developer - Fashion Tech',
      company: 'Myntra',
      description: 'Develop mobile applications for fashion e-commerce platform. Work on iOS/Android apps with focus on user experience and performance.',
      requirements: ['B.Tech in Computer Science', '2-4 years mobile development', 'iOS/Android development expertise', 'Fashion/e-commerce interest', 'Strong UI/UX sense'],
      location: 'Bangalore, Karnataka',
      locationType: 'ONSITE',
      salaryMin: 900000,
      salaryMax: 1600000,
      experienceLevel: 'MID',
      skills: ['iOS Development', 'Android Development', 'React Native', 'Swift', 'Kotlin'],
      benefits: ['Stock Options', 'Health Insurance', 'Fashion Allowance', 'Flexible Hours', 'Learning Budget'],
      department: 'Mobile Engineering',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // Nykaa Jobs
    {
      title: 'E-commerce Developer',
      company: 'Nykaa',
      description: 'Build and enhance e-commerce platform for beauty and fashion. Work on web applications, mobile apps, and backend systems.',
      requirements: ['B.Tech/B.E in Computer Science', '1-3 years web development', 'E-commerce platform experience', 'Full stack development skills', 'Beauty/fashion domain interest'],
      location: 'Mumbai, Maharashtra',
      locationType: 'HYBRID',
      salaryMin: 600000,
      salaryMax: 1100000,
      experienceLevel: 'JUNIOR',
      skills: ['React', 'Node.js', 'MongoDB', 'E-commerce', 'REST APIs', 'JavaScript'],
      benefits: ['Health Insurance', 'Product Discounts', 'Flexible Work', 'Skill Development', 'Team Outings'],
      department: 'Technology',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // Banking Sector - HDFC Bank
    {
      title: 'Technology Analyst - Digital Banking',
      company: 'HDFC Bank',
      description: 'Develop digital banking solutions and mobile applications. Work on core banking systems, payment gateways, and customer-facing applications.',
      requirements: ['B.Tech/B.E in Computer Science', '2-4 years banking/fintech experience', 'Java/.NET expertise', 'Database knowledge', 'Banking domain understanding'],
      location: 'Mumbai, Maharashtra',
      locationType: 'ONSITE',
      salaryMin: 800000,
      salaryMax: 1300000,
      experienceLevel: 'MID',
      skills: ['Java', '.NET', 'Oracle', 'Banking Systems', 'Web Services', 'Security'],
      benefits: ['Health Insurance', 'Bank Loan Benefits', 'Provident Fund', 'Performance Bonus', 'Job Security'],
      department: 'Digital Technology',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // ICICI Bank
    {
      title: 'Software Developer - Core Banking',
      company: 'ICICI Bank',
      description: 'Work on core banking applications and digital transformation initiatives. Develop secure and scalable banking software solutions.',
      requirements: ['B.Tech in Computer Science', '1-3 years software development', 'Strong programming skills', 'Database knowledge', 'Interest in banking technology'],
      location: 'Pune, Maharashtra',
      locationType: 'ONSITE',
      salaryMin: 600000,
      salaryMax: 1000000,
      experienceLevel: 'JUNIOR',
      skills: ['Java', 'Spring', 'Oracle', 'Web Services', 'Banking Applications', 'Security'],
      benefits: ['Health Insurance', 'Banking Benefits', 'Provident Fund', 'Career Growth', 'Training Programs'],
      department: 'Information Technology',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // Kotak Mahindra Bank
    {
      title: 'Senior Technology Manager - Fintech',
      company: 'Kotak Mahindra Bank',
      description: 'Lead technology teams in developing innovative fintech solutions. Drive digital transformation and manage technology projects.',
      requirements: ['B.Tech/M.Tech + 6-8 years experience', 'Banking technology experience', 'Team leadership skills', 'Project management', 'Fintech domain knowledge'],
      location: 'Mumbai, Maharashtra',
      locationType: 'HYBRID',
      salaryMin: 1800000,
      salaryMax: 2800000,
      experienceLevel: 'SENIOR',
      skills: ['Technology Leadership', 'Banking Systems', 'Project Management', 'Team Management', 'Fintech'],
      benefits: ['Stock Options', 'Health Insurance', 'Banking Benefits', 'Leadership Training', 'Performance Bonus'],
      department: 'Technology',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // Telecom - Reliance Jio
    {
      title: 'Network Software Engineer',
      company: 'Reliance Jio',
      description: 'Develop software solutions for telecom network infrastructure. Work on 5G technologies, network optimization, and telecom applications.',
      requirements: ['B.Tech in Electronics/Computer Science', '2-4 years telecom experience', 'Network protocols knowledge', 'C/C++ programming', 'Telecom domain understanding'],
      location: 'Navi Mumbai, Maharashtra',
      locationType: 'ONSITE',
      salaryMin: 700000,
      salaryMax: 1200000,
      experienceLevel: 'MID',
      skills: ['C/C++', 'Network Protocols', 'Linux', 'Telecom Systems', '5G Technology'],
      benefits: ['Health Insurance', 'Telecom Benefits', 'Performance Bonus', 'Skill Development', 'Job Security'],
      department: 'Network Engineering',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // Bharti Airtel
    {
      title: 'Digital Solutions Developer',
      company: 'Bharti Airtel',
      description: 'Build digital solutions and mobile applications for telecom services. Work on customer-facing apps and internal systems.',
      requirements: ['B.Tech/B.E in Computer Science', '1-3 years development experience', 'Mobile/Web development skills', 'API development', 'Telecom interest'],
      location: 'Gurgaon, Haryana',
      locationType: 'HYBRID',
      salaryMin: 600000,
      salaryMax: 1000000,
      experienceLevel: 'JUNIOR',
      skills: ['Java', 'Android', 'iOS', 'REST APIs', 'Mobile Development', 'Web Services'],
      benefits: ['Health Insurance', 'Telecom Benefits', 'Flexible Work', 'Career Growth', 'Training'],
      department: 'Digital Technology',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // Automobile - Tata Motors
    {
      title: 'Embedded Software Engineer',
      company: 'Tata Motors',
      description: 'Develop embedded software for automotive systems. Work on vehicle control units, infotainment systems, and autonomous driving features.',
      requirements: ['B.Tech in Electronics/Computer Science', '2-4 years embedded experience', 'C/C++ programming', 'Automotive protocols', 'RTOS knowledge'],
      location: 'Pune, Maharashtra',
      locationType: 'ONSITE',
      salaryMin: 600000,
      salaryMax: 1100000,
      experienceLevel: 'MID',
      skills: ['Embedded C', 'RTOS', 'CAN Protocol', 'Automotive Systems', 'Microcontrollers'],
      benefits: ['Health Insurance', 'Vehicle Loan Benefits', 'Provident Fund', 'Performance Bonus', 'Technical Training'],
      department: 'R&D - Software',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // Mahindra & Mahindra
    {
      title: 'IoT Developer - Connected Vehicles',
      company: 'Mahindra & Mahindra',
      description: 'Develop IoT solutions for connected vehicles and smart mobility. Work on telematics, vehicle connectivity, and data analytics.',
      requirements: ['B.Tech in Computer Science/Electronics', '1-3 years IoT experience', 'Embedded systems knowledge', 'Cloud platforms', 'Automotive interest'],
      location: 'Chennai, Tamil Nadu',
      locationType: 'ONSITE',
      salaryMin: 500000,
      salaryMax: 900000,
      experienceLevel: 'JUNIOR',
      skills: ['IoT Development', 'Embedded Systems', 'Cloud Computing', 'Data Analytics', 'Automotive'],
      benefits: ['Health Insurance', 'Vehicle Benefits', 'Skill Development', 'Performance Bonus', 'Career Growth'],
      department: 'Connected Mobility',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // Pharmaceutical - Dr. Reddy's
    {
      title: 'IT Application Developer - Pharma',
      company: "Dr. Reddy's Laboratories",
      description: 'Develop IT applications for pharmaceutical operations. Work on ERP systems, regulatory compliance software, and data management systems.',
      requirements: ['B.Tech/B.Pharm with IT background', '2-4 years application development', 'ERP systems knowledge', 'Pharmaceutical domain understanding', 'Regulatory compliance awareness'],
      location: 'Hyderabad, Telangana',
      locationType: 'ONSITE',
      salaryMin: 600000,
      salaryMax: 1000000,
      experienceLevel: 'MID',
      skills: ['Java', '.NET', 'SAP', 'Oracle', 'Pharmaceutical Systems', 'Compliance'],
      benefits: ['Health Insurance', 'Medical Benefits', 'Provident Fund', 'Performance Bonus', 'Learning Opportunities'],
      department: 'Information Technology',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // Cipla
    {
      title: 'Data Analyst - Pharmaceutical Research',
      company: 'Cipla',
      description: 'Analyze pharmaceutical data and support drug development processes. Work with clinical trial data, regulatory submissions, and market analysis.',
      requirements: ['B.Tech/M.Tech in Computer Science/Statistics', '1-3 years data analysis experience', 'Pharmaceutical domain knowledge', 'Statistical analysis skills', 'Regulatory understanding'],
      location: 'Mumbai, Maharashtra',
      locationType: 'HYBRID',
      salaryMin: 500000,
      salaryMax: 800000,
      experienceLevel: 'JUNIOR',
      skills: ['Data Analysis', 'Statistics', 'Python/R', 'SQL', 'Pharmaceutical Research', 'Regulatory'],
      benefits: ['Health Insurance', 'Medical Benefits', 'Flexible Work', 'Research Exposure', 'Career Development'],
      department: 'Data & Analytics',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // Retail - Reliance Retail
    {
      title: 'E-commerce Platform Developer',
      company: 'Reliance Retail',
      description: 'Build and maintain e-commerce platforms for retail operations. Work on omnichannel solutions, inventory management, and customer experience.',
      requirements: ['B.Tech in Computer Science', '2-4 years e-commerce development', 'Full stack development skills', 'Retail domain knowledge', 'Scalable systems experience'],
      location: 'Mumbai, Maharashtra',
      locationType: 'HYBRID',
      salaryMin: 700000,
      salaryMax: 1200000,
      experienceLevel: 'MID',
      skills: ['React', 'Node.js', 'MongoDB', 'E-commerce', 'Microservices', 'REST APIs'],
      benefits: ['Health Insurance', 'Retail Discounts', 'Performance Bonus', 'Career Growth', 'Learning Budget'],
      department: 'Digital Commerce',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // Future Group
    {
      title: 'Retail Technology Specialist',
      company: 'Future Group',
      description: 'Implement technology solutions for retail operations. Work on POS systems, inventory management, and customer analytics.',
      requirements: ['B.Tech/B.E in Computer Science', '1-3 years retail technology experience', 'POS systems knowledge', 'Database skills', 'Retail operations understanding'],
      location: 'Bangalore, Karnataka',
      locationType: 'ONSITE',
      salaryMin: 450000,
      salaryMax: 750000,
      experienceLevel: 'JUNIOR',
      skills: ['Java', 'SQL', 'POS Systems', 'Retail Technology', 'Database Management'],
      benefits: ['Health Insurance', 'Retail Benefits', 'Skill Development', 'Performance Incentives', 'Career Growth'],
      department: 'Retail Technology',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // Media & Entertainment - Zee Entertainment
    {
      title: 'Software Developer - Media Technology',
      company: 'Zee Entertainment',
      description: 'Develop software solutions for media and entertainment industry. Work on streaming platforms, content management systems, and digital media applications.',
      requirements: ['B.Tech in Computer Science', '1-3 years development experience', 'Media technology interest', 'Streaming platforms knowledge', 'Web/Mobile development'],
      location: 'Mumbai, Maharashtra',
      locationType: 'HYBRID',
      salaryMin: 500000,
      salaryMax: 900000,
      experienceLevel: 'JUNIOR',
      skills: ['JavaScript', 'React', 'Node.js', 'Video Streaming', 'Content Management', 'Media Technology'],
      benefits: ['Health Insurance', 'Entertainment Benefits', 'Flexible Work', 'Creative Environment', 'Skill Development'],
      department: 'Technology',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // Star India (Disney)
    {
      title: 'Senior Developer - Streaming Platform',
      company: 'Star India (Disney)',
      description: 'Build and scale streaming platform serving millions of users. Work on video delivery, content recommendation, and user experience optimization.',
      requirements: ['B.Tech/M.Tech in Computer Science', '3-5 years streaming/media experience', 'Scalable systems expertise', 'Video technology knowledge', 'High-traffic applications'],
      location: 'Mumbai, Maharashtra',
      locationType: 'ONSITE',
      salaryMin: 1200000,
      salaryMax: 2000000,
      experienceLevel: 'SENIOR',
      skills: ['Java', 'Microservices', 'Video Streaming', 'CDN', 'Scalable Systems', 'AWS'],
      benefits: ['Stock Options', 'Health Insurance', 'Entertainment Benefits', 'Global Exposure', 'Learning Budget'],
      department: 'Streaming Technology',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // Government Sector - ISRO
    {
      title: 'Scientist/Engineer - Software Development',
      company: 'Indian Space Research Organisation (ISRO)',
      description: 'Develop software for space missions and satellite systems. Work on mission-critical applications, ground control systems, and space technology.',
      requirements: ['B.E/B.Tech in Computer Science/Electronics', 'GATE qualification', 'Strong programming skills', 'System software knowledge', 'Interest in space technology'],
      location: 'Bangalore, Karnataka',
      locationType: 'ONSITE',
      salaryMin: 560000,
      salaryMax: 800000,
      experienceLevel: 'ENTRY',
      skills: ['C/C++', 'System Programming', 'Real-time Systems', 'Embedded Systems', 'Space Technology'],
      benefits: ['Government Benefits', 'Job Security', 'Pension', 'Medical Benefits', 'Prestigious Work'],
      department: 'Software Development',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // DRDO
    {
      title: 'Senior Technical Officer - Defense Software',
      company: 'Defence Research and Development Organisation (DRDO)',
      description: 'Develop software for defense applications and systems. Work on radar systems, missile guidance, and defense communication systems.',
      requirements: ['B.E/B.Tech + 3-5 years experience', 'Defense domain knowledge', 'Real-time systems experience', 'Security clearance eligible', 'Strong technical skills'],
      location: 'New Delhi',
      locationType: 'ONSITE',
      salaryMin: 800000,
      salaryMax: 1200000,
      experienceLevel: 'SENIOR',
      skills: ['C/C++', 'Real-time Systems', 'Defense Technology', 'Embedded Systems', 'System Design'],
      benefits: ['Government Benefits', 'Job Security', 'Defense Allowances', 'Medical Benefits', 'Pension'],
      department: 'Defense Technology',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // Energy Sector - ONGC
    {
      title: 'IT Officer - Oil & Gas Technology',
      company: 'Oil and Natural Gas Corporation (ONGC)',
      description: 'Develop IT solutions for oil and gas operations. Work on exploration software, production systems, and enterprise applications.',
      requirements: ['B.Tech in Computer Science/IT', '1-3 years experience', 'Enterprise applications knowledge', 'Oil & gas domain interest', 'ERP systems familiarity'],
      location: 'Mumbai, Maharashtra',
      locationType: 'ONSITE',
      salaryMin: 600000,
      salaryMax: 900000,
      experienceLevel: 'JUNIOR',
      skills: ['Java', '.NET', 'Oracle', 'SAP', 'Enterprise Applications', 'Oil & Gas Systems'],
      benefits: ['Government Benefits', 'Medical Benefits', 'Provident Fund', 'Job Security', 'Energy Sector Exposure'],
      department: 'Information Technology',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // Power Grid Corporation
    {
      title: 'Software Engineer - Power Systems',
      company: 'Power Grid Corporation of India',
      description: 'Develop software for power transmission and grid management. Work on SCADA systems, energy management, and grid automation.',
      requirements: ['B.Tech in Computer Science/Electrical', '1-2 years experience', 'Power systems knowledge', 'SCADA systems familiarity', 'Real-time applications'],
      location: 'Gurgaon, Haryana',
      locationType: 'ONSITE',
      salaryMin: 550000,
      salaryMax: 800000,
      experienceLevel: 'JUNIOR',
      skills: ['C/C++', 'SCADA', 'Power Systems', 'Real-time Applications', 'Database Systems'],
      benefits: ['Government Benefits', 'Medical Benefits', 'Job Security', 'Power Sector Exposure', 'Training'],
      department: 'IT & Automation',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // Internship Opportunities
    {
      title: 'Software Development Intern',
      company: 'Microsoft India',
      description: 'Summer internship program for computer science students. Work on real projects with mentorship from senior engineers.',
      requirements: ['Currently pursuing B.Tech/M.Tech in Computer Science', 'Strong programming skills', 'Good academic record', 'Problem-solving abilities', 'Passion for technology'],
      location: 'Hyderabad, Telangana',
      locationType: 'ONSITE',
      salaryMin: 80000,
      salaryMax: 100000,
      experienceLevel: 'ENTRY',
      skills: ['Programming', 'Data Structures', 'Algorithms', 'Software Development', 'Problem Solving'],
      benefits: ['Mentorship', 'Learning Opportunities', 'Networking', 'Certification', 'Full-time Conversion Opportunity'],
      department: 'Engineering',
      employmentType: 'INTERNSHIP',
      isActive: true,
      createdBy: admin._id,
    },
    {
      title: 'Data Science Intern',
      company: 'Google India',
      description: 'Internship opportunity to work on machine learning and data science projects. Gain hands-on experience with large-scale data systems.',
      requirements: ['Currently pursuing M.Tech/PhD in relevant field', 'Strong in Python/R', 'Machine learning knowledge', 'Statistics background', 'Research experience preferred'],
      location: 'Bangalore, Karnataka',
      locationType: 'ONSITE',
      salaryMin: 90000,
      salaryMax: 120000,
      experienceLevel: 'ENTRY',
      skills: ['Python', 'Machine Learning', 'Statistics', 'Data Analysis', 'Research'],
      benefits: ['World-class Mentorship', 'Global Exposure', 'Learning Resources', 'Networking', 'Full-time Opportunity'],
      department: 'Research & Development',
      employmentType: 'INTERNSHIP',
      isActive: true,
      createdBy: admin._id,
    },
    {
      title: 'Product Management Intern',
      company: 'Amazon India',
      description: 'Learn product management in a fast-paced e-commerce environment. Work on product strategy, user research, and feature development.',
      requirements: ['MBA/B.Tech with product interest', 'Strong analytical skills', 'Customer-centric thinking', 'Communication skills', 'Business acumen'],
      location: 'Bangalore, Karnataka',
      locationType: 'ONSITE',
      salaryMin: 75000,
      salaryMax: 95000,
      experienceLevel: 'ENTRY',
      skills: ['Product Management', 'Analytics', 'User Research', 'Business Strategy', 'Communication'],
      benefits: ['Product Exposure', 'Mentorship', 'Business Learning', 'Networking', 'Career Development'],
      department: 'Product Management',
      employmentType: 'INTERNSHIP',
      isActive: true,
      createdBy: admin._id,
    },

    // Remote Opportunities
    {
      title: 'Remote Full Stack Developer',
      company: 'Postman',
      description: 'Work remotely on API development platform used by millions of developers worldwide. Build features for API testing, documentation, and collaboration.',
      requirements: ['B.Tech in Computer Science', '2-4 years full stack experience', 'API development expertise', 'Remote work experience', 'Self-motivated and disciplined'],
      location: 'Remote (India)',
      locationType: 'REMOTE',
      salaryMin: 1200000,
      salaryMax: 2000000,
      experienceLevel: 'MID',
      skills: ['JavaScript', 'Node.js', 'React', 'APIs', 'MongoDB', 'Microservices'],
      benefits: ['Remote Work', 'Global Team', 'Learning Budget', 'Health Insurance', 'Flexible Hours'],
      department: 'Engineering',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },
    {
      title: 'Remote DevOps Engineer',
      company: 'GitLab',
      description: 'Work remotely on DevOps platform and infrastructure. Help build and maintain CI/CD pipelines and cloud infrastructure.',
      requirements: ['B.Tech + 3-5 years DevOps experience', 'Strong in Kubernetes/Docker', 'Cloud platforms expertise', 'Remote collaboration skills', 'Open source contribution preferred'],
      location: 'Remote (India)',
      locationType: 'REMOTE',
      salaryMin: 1500000,
      salaryMax: 2500000,
      experienceLevel: 'SENIOR',
      skills: ['Kubernetes', 'Docker', 'AWS/GCP', 'CI/CD', 'Infrastructure as Code', 'Monitoring'],
      benefits: ['Remote Work', 'Global Team', 'Open Source', 'Learning Budget', 'Conference Attendance'],
      department: 'Infrastructure',
      employmentType: 'FULL_TIME',
      isActive: true,
      createdBy: admin._id,
    },

    // Freelance/Contract Opportunities
    {
      title: 'Freelance Mobile App Developer',
      company: 'Various Clients',
      description: 'Freelance opportunities for mobile app development. Work on diverse projects for startups and enterprises across different domains.',
      requirements: ['3+ years mobile development experience', 'iOS/Android expertise', 'Portfolio of published apps', 'Client communication skills', 'Project management abilities'],
      location: 'Remote/Flexible',
      locationType: 'REMOTE',
      salaryMin: 500000,
      salaryMax: 1500000,
      experienceLevel: 'MID',
      skills: ['iOS Development', 'Android Development', 'React Native', 'Flutter', 'UI/UX', 'Project Management'],
      benefits: ['Flexible Schedule', 'Diverse Projects', 'High Hourly Rates', 'Skill Development', 'Entrepreneurial Experience'],
      department: 'Mobile Development',
      employmentType: 'FREELANCE',
      isActive: true,
      createdBy: admin._id,
    },
    {
      title: 'Contract Data Scientist',
      company: 'Multiple Organizations',
      description: 'Contract-based data science projects for various industries. Work on machine learning, analytics, and AI implementation projects.',
      requirements: ['M.Tech/PhD in relevant field', '4+ years data science experience', 'Strong portfolio of ML projects', 'Domain expertise in specific industries', 'Independent working ability'],
      location: 'Remote/Client Site',
      locationType: 'HYBRID',
      salaryMin: 800000,
      salaryMax: 2000000,
      experienceLevel: 'SENIOR',
      skills: ['Machine Learning', 'Deep Learning', 'Python/R', 'Big Data', 'Statistics', 'Business Intelligence'],
      benefits: ['High Compensation', 'Diverse Projects', 'Flexible Terms', 'Skill Enhancement', 'Industry Exposure'],
      department: 'Data Science',
      employmentType: 'CONTRACT',
      isActive: true,
      createdBy: admin._id,
    },
  ];

  for (const jobData of indianJobs) {
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
