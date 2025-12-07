import { PrismaClient, UserRole, JobType, JobStatus, ApplicationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

// ============================================================
// DATABASE SEED SCRIPT
// ============================================================
//
// This script seeds the database with initial/sample data for
// development and testing purposes.
//
// Usage:
//   npx ts-node src/database/seed.ts
//   # or via package.json script
//   npm run db:seed
// ============================================================

const prisma = new PrismaClient();

// ============================================================
// SEED DATA GENERATORS
// ============================================================

function generateId(): string {
  return `seed_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// ============================================================
// SEED FUNCTIONS
// ============================================================

async function seedUsers() {
  console.log('🌱 Seeding users...');

  const hashedPassword = await hashPassword('Password123!');

  const users = [
    {
      id: generateId(),
      email: 'admin@manithpro.com',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      emailVerified: true,
      isActive: true,
    },
    {
      id: generateId(),
      email: 'recruiter@manithpro.com',
      passwordHash: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: UserRole.RECRUITER,
      emailVerified: true,
      isActive: true,
    },
    {
      id: generateId(),
      email: 'hiring.manager@manithpro.com',
      passwordHash: hashedPassword,
      firstName: 'Michael',
      lastName: 'Chen',
      role: UserRole.HIRING_MANAGER,
      emailVerified: true,
      isActive: true,
    },
    {
      id: generateId(),
      email: 'candidate@example.com',
      passwordHash: hashedPassword,
      firstName: 'Emily',
      lastName: 'Davis',
      role: UserRole.CANDIDATE,
      emailVerified: true,
      isActive: true,
    },
    {
      id: generateId(),
      email: 'candidate2@example.com',
      passwordHash: hashedPassword,
      firstName: 'James',
      lastName: 'Wilson',
      role: UserRole.CANDIDATE,
      emailVerified: true,
      isActive: true,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  console.log(`✅ Created ${users.length} users`);
  return users;
}

async function seedJobs(recruiterId: string) {
  console.log('🌱 Seeding jobs...');

  const jobs = [
    {
      id: generateId(),
      title: 'Senior Software Engineer',
      description: `
        We're looking for a Senior Software Engineer to join our growing team.

        **Responsibilities:**
        - Design and implement scalable backend services
        - Mentor junior developers
        - Participate in code reviews
        - Collaborate with product and design teams

        **Requirements:**
        - 5+ years of software development experience
        - Strong proficiency in TypeScript/JavaScript
        - Experience with Node.js and PostgreSQL
        - Familiarity with cloud services (AWS/GCP)
      `,
      companyName: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      type: JobType.FULL_TIME,
      status: JobStatus.OPEN,
      salaryMin: 150000,
      salaryMax: 200000,
      experienceLevel: 'Senior',
      department: 'Engineering',
      skills: ['TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'React'],
      postedById: recruiterId,
    },
    {
      id: generateId(),
      title: 'Product Designer',
      description: `
        Join our design team to create beautiful and intuitive user experiences.

        **Responsibilities:**
        - Create wireframes, prototypes, and high-fidelity designs
        - Conduct user research and usability testing
        - Collaborate with engineers and product managers

        **Requirements:**
        - 3+ years of product design experience
        - Proficiency in Figma
        - Strong portfolio demonstrating UX/UI skills
      `,
      companyName: 'TechCorp Inc.',
      location: 'Remote',
      type: JobType.FULL_TIME,
      status: JobStatus.OPEN,
      salaryMin: 120000,
      salaryMax: 160000,
      experienceLevel: 'Mid-Level',
      department: 'Design',
      skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping'],
      postedById: recruiterId,
    },
    {
      id: generateId(),
      title: 'DevOps Engineer',
      description: `
        Help us build and maintain our cloud infrastructure.

        **Responsibilities:**
        - Manage Kubernetes clusters
        - Implement CI/CD pipelines
        - Monitor system performance and reliability

        **Requirements:**
        - Experience with Docker and Kubernetes
        - Knowledge of Terraform or similar IaC tools
        - Strong scripting skills (Python, Bash)
      `,
      companyName: 'TechCorp Inc.',
      location: 'New York, NY',
      type: JobType.FULL_TIME,
      status: JobStatus.OPEN,
      salaryMin: 140000,
      salaryMax: 180000,
      experienceLevel: 'Mid-Level',
      department: 'Infrastructure',
      skills: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'CI/CD'],
      postedById: recruiterId,
    },
    {
      id: generateId(),
      title: 'Frontend Developer (Contract)',
      description: `
        3-month contract position for a skilled frontend developer.

        **Project:**
        Build a customer-facing dashboard for our analytics platform.

        **Requirements:**
        - Strong React and TypeScript experience
        - Experience with data visualization libraries
        - Availability to start immediately
      `,
      companyName: 'DataViz Solutions',
      location: 'Remote',
      type: JobType.CONTRACT,
      status: JobStatus.OPEN,
      salaryMin: 80,
      salaryMax: 100,
      experienceLevel: 'Mid-Level',
      department: 'Engineering',
      skills: ['React', 'TypeScript', 'D3.js', 'Tailwind CSS'],
      postedById: recruiterId,
    },
    {
      id: generateId(),
      title: 'Junior Data Analyst',
      description: `
        Entry-level position for aspiring data analysts.

        **Responsibilities:**
        - Analyze business data and create reports
        - Build dashboards in Tableau/Power BI
        - Support senior analysts with research

        **Requirements:**
        - Bachelor's degree in related field
        - Basic SQL knowledge
        - Strong Excel skills
      `,
      companyName: 'Analytics Co.',
      location: 'Chicago, IL',
      type: JobType.FULL_TIME,
      status: JobStatus.OPEN,
      salaryMin: 60000,
      salaryMax: 80000,
      experienceLevel: 'Entry-Level',
      department: 'Analytics',
      skills: ['SQL', 'Excel', 'Tableau', 'Python'],
      postedById: recruiterId,
    },
  ];

  for (const job of jobs) {
    await prisma.job.upsert({
      where: { id: job.id },
      update: {},
      create: job,
    });
  }

  console.log(`✅ Created ${jobs.length} jobs`);
  return jobs;
}

async function seedApplications(candidateIds: string[], jobIds: string[]) {
  console.log('🌱 Seeding applications...');

  const applications = [
    {
      id: generateId(),
      jobId: jobIds[0],
      candidateId: candidateIds[0],
      status: ApplicationStatus.SCREENING,
      coverLetter: 'I am excited to apply for this Senior Software Engineer position...',
      resumeUrl: 'https://example.com/resume1.pdf',
    },
    {
      id: generateId(),
      jobId: jobIds[0],
      candidateId: candidateIds[1],
      status: ApplicationStatus.INTERVIEW,
      coverLetter: 'With 6 years of experience in full-stack development...',
      resumeUrl: 'https://example.com/resume2.pdf',
    },
    {
      id: generateId(),
      jobId: jobIds[1],
      candidateId: candidateIds[0],
      status: ApplicationStatus.APPLIED,
      coverLetter: 'As a designer with a passion for user experience...',
      resumeUrl: 'https://example.com/resume1.pdf',
    },
    {
      id: generateId(),
      jobId: jobIds[2],
      candidateId: candidateIds[1],
      status: ApplicationStatus.OFFER,
      coverLetter: 'I have extensive experience with cloud infrastructure...',
      resumeUrl: 'https://example.com/resume2.pdf',
    },
  ];

  for (const app of applications) {
    await prisma.application.upsert({
      where: { id: app.id },
      update: {},
      create: app,
    });
  }

  console.log(`✅ Created ${applications.length} applications`);
  return applications;
}

async function seedCandidateProfiles(candidateIds: string[]) {
  console.log('🌱 Seeding candidate profiles...');

  const profiles = [
    {
      id: generateId(),
      userId: candidateIds[0],
      headline: 'Full-Stack Developer | React & Node.js Specialist',
      summary: 'Passionate software developer with 5 years of experience building web applications.',
      location: 'San Francisco, CA',
      experienceYears: 5,
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'],
      education: 'B.S. Computer Science, Stanford University',
      linkedinUrl: 'https://linkedin.com/in/emilydavis',
      githubUrl: 'https://github.com/emilydavis',
      portfolioUrl: 'https://emilydavis.dev',
      isOpenToWork: true,
      preferredJobTypes: [JobType.FULL_TIME, JobType.REMOTE],
      preferredLocations: ['San Francisco, CA', 'Remote'],
      salaryExpectation: 160000,
    },
    {
      id: generateId(),
      userId: candidateIds[1],
      headline: 'Senior DevOps Engineer | Cloud Architecture Expert',
      summary: 'DevOps professional with expertise in Kubernetes, AWS, and CI/CD pipelines.',
      location: 'New York, NY',
      experienceYears: 7,
      skills: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'Python', 'Go'],
      education: 'M.S. Computer Engineering, MIT',
      linkedinUrl: 'https://linkedin.com/in/jameswilson',
      githubUrl: 'https://github.com/jameswilson',
      isOpenToWork: true,
      preferredJobTypes: [JobType.FULL_TIME],
      preferredLocations: ['New York, NY', 'Boston, MA'],
      salaryExpectation: 180000,
    },
  ];

  for (const profile of profiles) {
    await prisma.candidateProfile.upsert({
      where: { userId: profile.userId },
      update: {},
      create: profile,
    });
  }

  console.log(`✅ Created ${profiles.length} candidate profiles`);
  return profiles;
}

async function seedNotifications(userIds: string[]) {
  console.log('🌱 Seeding notifications...');

  const notifications = [
    {
      id: generateId(),
      userId: userIds[0],
      type: 'APPLICATION_UPDATE',
      title: 'Application Status Updated',
      message: 'Your application for Senior Software Engineer has been moved to screening.',
      isRead: false,
    },
    {
      id: generateId(),
      userId: userIds[0],
      type: 'INTERVIEW_SCHEDULED',
      title: 'Interview Scheduled',
      message: 'You have an interview scheduled for tomorrow at 2:00 PM.',
      isRead: true,
    },
    {
      id: generateId(),
      userId: userIds[1],
      type: 'NEW_APPLICATION',
      title: 'New Application Received',
      message: 'A new application has been submitted for the Senior Software Engineer position.',
      isRead: false,
    },
  ];

  for (const notification of notifications) {
    await prisma.notification.create({
      data: notification,
    });
  }

  console.log(`✅ Created ${notifications.length} notifications`);
  return notifications;
}

// ============================================================
// MAIN SEED FUNCTION
// ============================================================

async function main() {
  console.log('\n🌱 Starting database seed...\n');

  try {
    // Seed users
    const users = await seedUsers();
    const recruiter = users.find((u) => u.role === UserRole.RECRUITER);
    const candidates = users.filter((u) => u.role === UserRole.CANDIDATE);

    if (!recruiter) {
      throw new Error('Recruiter user not found');
    }

    // Seed jobs
    const jobs = await seedJobs(recruiter.id);

    // Seed applications
    await seedApplications(
      candidates.map((c) => c.id),
      jobs.map((j) => j.id)
    );

    // Seed candidate profiles
    await seedCandidateProfiles(candidates.map((c) => c.id));

    // Seed notifications
    await seedNotifications(users.map((u) => u.id));

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📋 Test Accounts:');
    console.log('  Admin:     admin@manithpro.com / Password123!');
    console.log('  Recruiter: recruiter@manithpro.com / Password123!');
    console.log('  Hiring Manager: hiring.manager@manithpro.com / Password123!');
    console.log('  Candidate: candidate@example.com / Password123!');
    console.log('  Candidate: candidate2@example.com / Password123!');
  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
    throw error;
  }
}

// ============================================================
// CLEAN FUNCTION
// ============================================================

async function clean() {
  console.log('\n🧹 Cleaning database...\n');

  // Delete in reverse order of dependencies
  const tablesToClean = [
    'Notification',
    'Message',
    'Interview',
    'Application',
    'SavedJob',
    'CandidateProfile',
    'Job',
    'User',
  ];

  for (const table of tablesToClean) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`);
      console.log(`  ✓ Cleaned ${table}`);
    } catch (error) {
      console.warn(`  ⚠ Could not clean ${table}:`, error);
    }
  }

  console.log('\n✅ Database cleaned successfully!\n');
}

// ============================================================
// CLI EXECUTION
// ============================================================

const command = process.argv[2];

async function run() {
  try {
    await prisma.$connect();

    switch (command) {
      case 'clean':
        await clean();
        break;
      case 'reset':
        await clean();
        await main();
        break;
      default:
        await main();
    }
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();

export { main as seed, clean };
