-- =============================================================================
-- ManithPro Recruitment Portal - Seed Data
-- Database: PostgreSQL (Neon compatible)
-- Generated: 2025-12-31
-- Description: Seed data with 2 records per table for initial deployment
-- =============================================================================

-- Note: Run this after running Prisma migrations
-- Command: psql -h your-neon-host -U your-user -d your-db -f manith_pro_seed_data.sql

-- =============================================================================
-- ENUMS (These are created by Prisma migrations, included here for reference)
-- =============================================================================

-- UserRole: CANDIDATE, RECRUITER, ADMIN, SUPER_ADMIN
-- JobType: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE, REMOTE
-- JobStatus: DRAFT, OPEN, CLOSED, PAUSED, FILLED
-- ApplicationStatus: PENDING, REVIEWING, SHORTLISTED, INTERVIEW, OFFER, REJECTED, WITHDRAWN, ACCEPTED
-- InterviewType: PHONE, VIDEO, IN_PERSON, TECHNICAL, BEHAVIORAL, PANEL, FINAL
-- InterviewStatus: SCHEDULED, COMPLETED, CANCELLED, RESCHEDULED, NO_SHOW
-- MessageStatus: SENT, DELIVERED, READ
-- NotificationType: APPLICATION, INTERVIEW, MESSAGE, JOB, SYSTEM, REMINDER, PROFILE
-- AuditAction: CREATE, UPDATE, DELETE, LOGIN, LOGOUT, VIEW, EXPORT, IMPORT, APPROVE, REJECT
-- SubscriptionPlan: FREE, BASIC, PROFESSIONAL, ENTERPRISE, CUSTOM
-- SubscriptionStatus: TRIAL, ACTIVE, PAST_DUE, CANCELLED, EXPIRED
-- PaymentStatus: PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED
-- PaymentMethod: CREDIT_CARD, DEBIT_CARD, PAYPAL, BANK_TRANSFER, CRYPTO
-- ErrorLevel: DEBUG, INFO, WARNING, ERROR, CRITICAL
-- VerificationStatus: PENDING, VERIFIED, REJECTED, EXPIRED
-- SkillProficiencyLevel: BEGINNER, ELEMENTARY, INTERMEDIATE, ADVANCED, EXPERT
-- EmploymentType: FULL_TIME, PART_TIME, CONTRACT, FREELANCE, INTERNSHIP, APPRENTICESHIP, SELF_EMPLOYED
-- IntegrationStatus: PENDING, CONNECTED, DISCONNECTED, ERROR, EXPIRED

-- =============================================================================
-- 1. USERS TABLE (Core table - must be seeded first)
-- =============================================================================
INSERT INTO users (id, email, password, "firstName", "lastName", role, phone, bio, skills, experience, education, location, "linkedIn", portfolio, "createdAt", "updatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@manithpro.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4Tsl3yVmOgRqTlhW', 'Admin', 'User', 'ADMIN', '+1234567890', 'System administrator with full access', ARRAY['System Administration', 'User Management'], '10', 'Computer Science', 'New York, USA', 'https://linkedin.com/in/admin', 'https://admin.portfolio.com', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'recruiter@manithpro.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4Tsl3yVmOgRqTlhW', 'John', 'Recruiter', 'RECRUITER', '+1234567891', 'Senior Technical Recruiter specializing in software engineering', ARRAY['Talent Acquisition', 'Technical Recruiting', 'Sourcing'], '8', 'Human Resources', 'San Francisco, USA', 'https://linkedin.com/in/johnrecruiter', NULL, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'candidate@manithpro.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4Tsl3yVmOgRqTlhW', 'Jane', 'Developer', 'CANDIDATE', '+1234567892', 'Full-stack developer with 5 years of experience', ARRAY['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'TypeScript'], '5', 'Software Engineering', 'Austin, USA', 'https://linkedin.com/in/janedeveloper', 'https://github.com/janedeveloper', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'candidate2@manithpro.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4Tsl3yVmOgRqTlhW', 'Mike', 'Designer', 'CANDIDATE', '+1234567893', 'UI/UX Designer with expertise in design systems', ARRAY['Figma', 'Adobe XD', 'UI Design', 'UX Research', 'Prototyping'], '4', 'Graphic Design', 'Seattle, USA', 'https://linkedin.com/in/mikedesigner', 'https://dribbble.com/mikedesigner', NOW(), NOW());

-- Password for all users: password123 (bcrypt hashed)

-- =============================================================================
-- 2. JOBS TABLE
-- =============================================================================
INSERT INTO jobs (id, title, description, requirements, responsibilities, location, type, salary, "salaryMin", "salaryMax", benefits, skills, experience, education, status, positions, deadline, "companyName", "companyDescription", "companyWebsite", "companyLogo", "companySize", "companyIndustry", "createdAt", "updatedAt", "postedById") VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Senior Full-Stack Developer', 'We are looking for an experienced Full-Stack Developer to join our growing engineering team. You will be responsible for developing and maintaining web applications using modern technologies.', ARRAY['5+ years of experience in web development', 'Strong proficiency in React and Node.js', 'Experience with PostgreSQL or similar databases', 'Knowledge of cloud services (AWS/GCP)'], ARRAY['Design and implement new features', 'Write clean, maintainable code', 'Collaborate with cross-functional teams', 'Mentor junior developers'], 'San Francisco, CA', 'FULL_TIME', '$120,000 - $180,000', 120000, 180000, ARRAY['Health Insurance', '401(k)', 'Remote Work', 'Unlimited PTO', 'Stock Options'], ARRAY['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'], '5+ years', 'Bachelor''s in CS or related field', 'OPEN', 2, NOW() + INTERVAL '30 days', 'TechCorp Inc.', 'Leading technology company building innovative solutions', 'https://techcorp.example.com', 'https://techcorp.example.com/logo.png', '500-1000', 'Technology', NOW(), NOW(), '550e8400-e29b-41d4-a716-446655440002'),
('660e8400-e29b-41d4-a716-446655440002', 'UI/UX Designer', 'Join our design team to create beautiful and intuitive user experiences. You will work closely with product and engineering teams to deliver world-class designs.', ARRAY['3+ years of UI/UX design experience', 'Proficiency in Figma and design tools', 'Strong portfolio demonstrating design skills', 'Experience with design systems'], ARRAY['Create wireframes, prototypes, and high-fidelity designs', 'Conduct user research and usability testing', 'Maintain and evolve the design system', 'Collaborate with developers on implementation'], 'Remote', 'REMOTE', '$90,000 - $130,000', 90000, 130000, ARRAY['Health Insurance', 'Remote Work', 'Learning Budget', 'Home Office Stipend'], ARRAY['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'Design Systems'], '3+ years', 'Bachelor''s in Design or related field', 'OPEN', 1, NOW() + INTERVAL '45 days', 'DesignHub Co.', 'Award-winning design agency creating digital experiences', 'https://designhub.example.com', 'https://designhub.example.com/logo.png', '50-200', 'Design', NOW(), NOW(), '550e8400-e29b-41d4-a716-446655440002');

-- =============================================================================
-- 3. APPLICATIONS TABLE
-- =============================================================================
INSERT INTO applications (id, resume, "coverLetter", status, notes, "appliedAt", "updatedAt", "jobId", "candidateId") VALUES
('770e8400-e29b-41d4-a716-446655440001', '/uploads/resumes/jane_developer_resume.pdf', 'I am excited to apply for the Senior Full-Stack Developer position. With 5 years of experience in React and Node.js, I believe I would be a great fit for your team.', 'REVIEWING', 'Strong candidate with relevant experience', NOW(), NOW(), '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003'),
('770e8400-e29b-41d4-a716-446655440002', '/uploads/resumes/mike_designer_resume.pdf', 'I am passionate about creating user-centered designs and would love to bring my expertise to DesignHub Co.', 'PENDING', NULL, NOW(), NOW(), '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004');

-- =============================================================================
-- 4. SAVED JOBS TABLE
-- =============================================================================
INSERT INTO saved_jobs (id, "userId", "jobId", "savedAt") VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', NOW()),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', NOW());

-- =============================================================================
-- 5. RESUMES TABLE (SKIPPED - table not in database)
-- =============================================================================
-- Resume model exists in schema but was not migrated to database

-- =============================================================================
-- 6. INTERVIEWS TABLE
-- =============================================================================
INSERT INTO interviews (id, type, status, "scheduledAt", "endTime", "timeZone", "meetingLink", location, instructions, notes, feedback, rating, "createdAt", "updatedAt", "applicationId", "scheduledById", "candidateId") VALUES
('aa0e8400-e29b-41d4-a716-446655440001', 'TECHNICAL', 'SCHEDULED', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '1 hour', 'America/Los_Angeles', 'https://meet.google.com/abc-defg-hij', NULL, 'Please join 5 minutes early. Have your IDE ready for live coding.', NULL, NULL, NULL, NOW(), NOW(), '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003'),
('aa0e8400-e29b-41d4-a716-446655440002', 'PHONE_SCREEN', 'SCHEDULED', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '30 minutes', 'America/New_York', NULL, NULL, 'Initial phone screening to discuss your background and experience.', NULL, NULL, NULL, NOW(), NOW(), '770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004');

-- =============================================================================
-- 7. MESSAGES TABLE
-- =============================================================================
INSERT INTO messages (id, content, status, attachments, "createdAt", "updatedAt", "senderId", "receiverId", "applicationId") VALUES
('bb0e8400-e29b-41d4-a716-446655440001', 'Hi Jane, thank you for applying to the Senior Full-Stack Developer position. We would like to schedule an initial interview with you. Are you available next week?', 'DELIVERED', ARRAY[]::TEXT[], NOW(), NOW(), '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001'),
('bb0e8400-e29b-41d4-a716-446655440002', 'Hi Mike, we received your application for the UI/UX Designer role. We will review your portfolio and get back to you soon.', 'SENT', ARRAY[]::TEXT[], NOW(), NOW(), '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440002');

-- =============================================================================
-- 8. NOTIFICATIONS TABLE
-- =============================================================================
INSERT INTO notifications (id, type, title, message, link, "isRead", "createdAt", "userId") VALUES
('cc0e8400-e29b-41d4-a716-446655440001', 'APPLICATION_RECEIVED', 'Application Received', 'Your application for Senior Full-Stack Developer has been received.', '/applications/770e8400-e29b-41d4-a716-446655440001', false, NOW(), '550e8400-e29b-41d4-a716-446655440003'),
('cc0e8400-e29b-41d4-a716-446655440002', 'INTERVIEW_SCHEDULED', 'Interview Scheduled', 'Your interview has been scheduled for next week.', '/interviews/aa0e8400-e29b-41d4-a716-446655440001', false, NOW(), '550e8400-e29b-41d4-a716-446655440003');

-- =============================================================================
-- 9. AUDIT LOGS TABLE
-- =============================================================================
INSERT INTO audit_logs (id, action, entity, "entityId", changes, "ipAddress", "userAgent", metadata, "createdAt", "userId", "performedBy") VALUES
('dd0e8400-e29b-41d4-a716-446655440001', 'CREATE', 'Job', '660e8400-e29b-41d4-a716-446655440001', '{"title": "Senior Full-Stack Developer"}', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '{"source": "web"}', NOW(), '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002'),
('dd0e8400-e29b-41d4-a716-446655440002', 'LOGIN', 'User', '550e8400-e29b-41d4-a716-446655440001', NULL, '192.168.1.100', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', '{"method": "email"}', NOW(), '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001');

-- =============================================================================
-- 10. FAQs TABLE
-- =============================================================================
INSERT INTO faqs (id, question, answer, category, "order", "isPublished", views, helpful, "notHelpful", "createdAt", "updatedAt") VALUES
('ee0e8400-e29b-41d4-a716-446655440001', 'How do I create an account?', 'To create an account, click the "Sign Up" button on the homepage. Fill in your email, create a password, and select whether you are a candidate or recruiter. You will receive a verification email to confirm your account.', 'Getting Started', 1, true, 150, 45, 5, NOW(), NOW()),
('ee0e8400-e29b-41d4-a716-446655440002', 'How can I apply for a job?', 'Browse jobs using the search function or filters. Click on a job posting to view details. If interested, click "Apply Now" and upload your resume. You can also add a cover letter to strengthen your application.', 'Job Applications', 2, true, 200, 60, 8, NOW(), NOW());

-- =============================================================================
-- 11. EMAIL TEMPLATES TABLE
-- =============================================================================
INSERT INTO email_templates (id, name, subject, body, variables, category, "isActive", "createdAt", "updatedAt") VALUES
('ff0e8400-e29b-41d4-a716-446655440001', 'application_received', 'Application Received - {{jobTitle}}', 'Dear {{candidateName}},\n\nThank you for applying to the {{jobTitle}} position at {{companyName}}.\n\nWe have received your application and will review it shortly. You can track the status of your application in your dashboard.\n\nBest regards,\n{{companyName}} Recruitment Team', ARRAY['candidateName', 'jobTitle', 'companyName'], 'Application', true, NOW(), NOW()),
('ff0e8400-e29b-41d4-a716-446655440002', 'interview_scheduled', 'Interview Scheduled - {{jobTitle}}', 'Dear {{candidateName}},\n\nWe are pleased to inform you that your interview for {{jobTitle}} has been scheduled.\n\nDate: {{interviewDate}}\nTime: {{interviewTime}}\nType: {{interviewType}}\n{{meetingLink}}\n\nPlease confirm your attendance by replying to this email.\n\nBest regards,\n{{recruiterName}}', ARRAY['candidateName', 'jobTitle', 'interviewDate', 'interviewTime', 'interviewType', 'meetingLink', 'recruiterName'], 'Interview', true, NOW(), NOW());

-- =============================================================================
-- 12. NOTIFICATION TEMPLATES TABLE
-- =============================================================================
INSERT INTO notification_templates (id, name, title, body, type, variables, "isActive", "createdAt", "updatedAt") VALUES
('100e8400-e29b-41d4-a716-446655440001', 'new_application', 'New Application Received', 'You have received a new application for {{jobTitle}} from {{candidateName}}.', 'APPLICATION_RECEIVED', ARRAY['jobTitle', 'candidateName'], true, NOW(), NOW()),
('100e8400-e29b-41d4-a716-446655440002', 'interview_reminder', 'Interview Reminder', 'Reminder: You have an interview scheduled for {{jobTitle}} on {{interviewDate}} at {{interviewTime}}.', 'INTERVIEW_REMINDER', ARRAY['jobTitle', 'interviewDate', 'interviewTime'], true, NOW(), NOW());

-- =============================================================================
-- 13. STATIC PAGES TABLE
-- =============================================================================
INSERT INTO static_pages (id, slug, title, content, "metaTitle", "metaDescription", "isPublished", "publishedAt", "createdAt", "updatedAt") VALUES
('110e8400-e29b-41d4-a716-446655440001', 'about-us', 'About Us', '# About ManithPro\n\nManithPro is a leading recruitment platform that connects talented professionals with top companies worldwide.\n\n## Our Mission\n\nTo revolutionize the hiring process by leveraging AI and technology to make recruitment faster, fairer, and more efficient.\n\n## Our Values\n\n- **Innovation**: We continuously improve our platform\n- **Transparency**: We believe in open communication\n- **Excellence**: We strive for the best results', 'About Us - ManithPro', 'Learn about ManithPro, our mission, values, and team.', true, NOW(), NOW(), NOW()),
('110e8400-e29b-41d4-a716-446655440002', 'privacy-policy', 'Privacy Policy', '# Privacy Policy\n\nLast updated: January 1, 2025\n\n## Information We Collect\n\nWe collect information you provide directly, including:\n- Account information (name, email)\n- Profile information (resume, skills)\n- Application data\n\n## How We Use Your Information\n\nWe use your information to:\n- Provide our services\n- Match you with relevant opportunities\n- Improve our platform', 'Privacy Policy - ManithPro', 'Read our privacy policy to understand how we handle your data.', true, NOW(), NOW(), NOW());

-- =============================================================================
-- 14. HELP ARTICLES TABLE
-- =============================================================================
INSERT INTO help_articles (id, title, slug, content, category, tags, views, helpful, "notHelpful", "isPublished", "publishedAt", "createdAt", "updatedAt") VALUES
('120e8400-e29b-41d4-a716-446655440001', 'Getting Started with ManithPro', 'getting-started', '## Welcome to ManithPro!\n\nThis guide will help you get started with our platform.\n\n### For Candidates\n\n1. Create your account\n2. Complete your profile\n3. Upload your resume\n4. Start applying for jobs\n\n### For Recruiters\n\n1. Create your company account\n2. Set up your company profile\n3. Post your first job\n4. Start reviewing applications', 'Getting Started', ARRAY['onboarding', 'setup', 'beginner'], 500, 120, 10, true, NOW(), NOW(), NOW()),
('120e8400-e29b-41d4-a716-446655440002', 'How to Optimize Your Profile', 'optimize-profile', '## Make Your Profile Stand Out\n\n### Profile Photo\n- Use a professional headshot\n- Ensure good lighting\n\n### Summary\n- Write a compelling summary\n- Highlight key achievements\n\n### Skills\n- Add relevant skills\n- Get endorsements from colleagues', 'Profile', ARRAY['profile', 'optimization', 'tips'], 350, 85, 5, true, NOW(), NOW(), NOW());

-- =============================================================================
-- 15. SUBSCRIPTIONS TABLE
-- =============================================================================
INSERT INTO subscriptions (id, plan, status, "startDate", "endDate", "trialEndDate", "maxJobs", "maxUsers", features, price, "billingCycle", "autoRenew", "createdAt", "updatedAt", "userId", "companyId") VALUES
('130e8400-e29b-41d4-a716-446655440001', 'PROFESSIONAL', 'ACTIVE', NOW(), NOW() + INTERVAL '1 year', NULL, 50, 10, '{"aiMatching": true, "analytics": true, "prioritySupport": true}', 299.00, 'monthly', true, NOW(), NOW(), '550e8400-e29b-41d4-a716-446655440002', NULL),
('130e8400-e29b-41d4-a716-446655440002', 'FREE', 'ACTIVE', NOW(), NULL, NOW() + INTERVAL '14 days', 3, 1, '{"aiMatching": false, "analytics": false, "prioritySupport": false}', 0.00, 'monthly', false, NOW(), NOW(), '550e8400-e29b-41d4-a716-446655440003', NULL);

-- =============================================================================
-- 16. PAYMENTS TABLE
-- =============================================================================
INSERT INTO payments (id, amount, currency, status, method, "transactionId", "stripePaymentId", "paypalOrderId", "cardLast4", "cardBrand", metadata, "failureReason", "paidAt", "createdAt", "updatedAt", "subscriptionId", "invoiceId") VALUES
('140e8400-e29b-41d4-a716-446655440001', 299.00, 'USD', 'COMPLETED', 'CREDIT_CARD', 'txn_1234567890abcdef', 'pi_1234567890', NULL, '4242', 'visa', '{"receiptUrl": "https://stripe.com/receipt/123"}', NULL, NOW(), NOW(), NOW(), '130e8400-e29b-41d4-a716-446655440001', NULL),
('140e8400-e29b-41d4-a716-446655440002', 299.00, 'USD', 'PENDING', 'CREDIT_CARD', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NOW(), NOW(), '130e8400-e29b-41d4-a716-446655440001', NULL);

-- =============================================================================
-- 17. INVOICES TABLE
-- =============================================================================
INSERT INTO invoices (id, "invoiceNumber", amount, tax, discount, total, currency, status, "dueDate", "paidAt", items, "billingAddress", notes, "createdAt", "updatedAt", "subscriptionId") VALUES
('150e8400-e29b-41d4-a716-446655440001', 'INV-2025-0001', 299.00, 0.00, 0.00, 299.00, 'USD', 'COMPLETED', NOW() + INTERVAL '30 days', NOW(), '[{"description": "Professional Plan - Monthly", "quantity": 1, "unitPrice": 299.00, "total": 299.00}]', '{"name": "TechCorp Inc.", "address": "123 Tech Street", "city": "San Francisco", "state": "CA", "zip": "94105"}', NULL, NOW(), NOW(), '130e8400-e29b-41d4-a716-446655440001'),
('150e8400-e29b-41d4-a716-446655440002', 'INV-2025-0002', 299.00, 0.00, 0.00, 299.00, 'USD', 'PENDING', NOW() + INTERVAL '30 days', NULL, '[{"description": "Professional Plan - Monthly", "quantity": 1, "unitPrice": 299.00, "total": 299.00}]', '{"name": "TechCorp Inc.", "address": "123 Tech Street", "city": "San Francisco", "state": "CA", "zip": "94105"}', NULL, NOW(), NOW(), '130e8400-e29b-41d4-a716-446655440001');

-- =============================================================================
-- 18. ERROR LOGS TABLE
-- =============================================================================
INSERT INTO error_logs (id, level, message, stack, context, endpoint, method, "statusCode", "userId", "ipAddress", "userAgent", resolved, "resolvedAt", "resolvedBy", notes, "createdAt") VALUES
('160e8400-e29b-41d4-a716-446655440001', 'ERROR', 'Database connection timeout', 'Error: Connection timeout\n    at connect (/app/src/db.ts:45)', '{"retryCount": 3, "timeout": 5000}', '/api/jobs', 'GET', 500, NULL, '192.168.1.1', 'Mozilla/5.0', true, NOW(), '550e8400-e29b-41d4-a716-446655440001', 'Database was restarted', NOW() - INTERVAL '1 day'),
('160e8400-e29b-41d4-a716-446655440002', 'WARNING', 'Rate limit exceeded', NULL, '{"userId": "550e8400-e29b-41d4-a716-446655440003", "requestCount": 150}', '/api/applications', 'POST', 429, '550e8400-e29b-41d4-a716-446655440003', '192.168.1.50', 'Mozilla/5.0', false, NULL, NULL, NULL, NOW());

-- =============================================================================
-- 19. SYSTEM CONFIG TABLE
-- =============================================================================
INSERT INTO system_configs (id, key, value, type, category, description, "isPublic", "updatedAt", "updatedBy") VALUES
('170e8400-e29b-41d4-a716-446655440001', 'max_applications_per_day', '10', 'number', 'limits', 'Maximum number of job applications a candidate can submit per day', false, NOW(), '550e8400-e29b-41d4-a716-446655440001'),
('170e8400-e29b-41d4-a716-446655440002', 'maintenance_mode', 'false', 'boolean', 'system', 'Enable maintenance mode to prevent user access', true, NOW(), '550e8400-e29b-41d4-a716-446655440001');

-- =============================================================================
-- 20. CANDIDATE PROFILES TABLE
-- =============================================================================
INSERT INTO candidate_profiles (id, "userId", headline, summary, "dateOfBirth", nationality, languages, address, city, state, country, "zipCode", "preferredLocation", "willingToRelocate", "remotePreference", "expectedSalary", "expectedSalaryCurrency", "noticePeriod", "availableFrom", "jobTypes", industries, "completenessScore", "lastCompletedSection", website, github, linkedin, twitter, stackoverflow, dribbble, behance, medium, kaggle, "isPublic", "allowMessages", "showSalaryExpectation", "createdAt", "updatedAt") VALUES
('180e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'Senior Full-Stack Developer | React & Node.js Expert', 'Passionate software developer with 5+ years of experience building scalable web applications. I specialize in React, Node.js, and cloud technologies. I love solving complex problems and mentoring junior developers.', '1992-05-15', 'American', '["English", "Spanish"]', '456 Developer Lane', 'Austin', 'TX', 'United States', '78701', ARRAY['Austin, TX', 'San Francisco, CA', 'Remote'], true, 'Remote-first', 150000.00, 'USD', '2 weeks', NOW() + INTERVAL '30 days', ARRAY['Full-time', 'Contract'], ARRAY['Technology', 'FinTech', 'HealthTech'], 85, 'skills', 'https://janedeveloper.dev', 'https://github.com/janedeveloper', 'https://linkedin.com/in/janedeveloper', 'https://twitter.com/janedeveloper', 'https://stackoverflow.com/users/123456/janedeveloper', NULL, NULL, 'https://medium.com/@janedeveloper', NULL, true, true, false, NOW(), NOW()),
('180e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'UI/UX Designer | Creating Delightful Digital Experiences', 'Creative designer with 4 years of experience in UI/UX design. I am passionate about creating intuitive and beautiful user interfaces that solve real problems. Expertise in design systems, user research, and prototyping.', '1995-08-22', 'American', '["English"]', '789 Design Ave', 'Seattle', 'WA', 'United States', '98101', ARRAY['Seattle, WA', 'Portland, OR', 'Remote'], true, 'Hybrid', 110000.00, 'USD', '2 weeks', NOW() + INTERVAL '14 days', ARRAY['Full-time'], ARRAY['Technology', 'Design', 'E-commerce'], 90, 'portfolio', 'https://mikedesigner.design', NULL, 'https://linkedin.com/in/mikedesigner', NULL, NULL, 'https://dribbble.com/mikedesigner', 'https://behance.net/mikedesigner', NULL, NULL, true, true, true, NOW(), NOW());

-- =============================================================================
-- 21. RECRUITER PROFILES TABLE (SKIPPED - table not in database)
-- =============================================================================
-- RecruiterProfile model exists in schema but was not migrated to database

-- =============================================================================
-- 22. WORK EXPERIENCES TABLE
-- =============================================================================
INSERT INTO work_experiences (id, "profileId", "companyName", "companyLogo", "companyWebsite", "companyLinkedin", "companySize", industry, title, "employmentType", department, location, "isRemote", "startDate", "endDate", "isCurrent", description, responsibilities, achievements, technologies, skills, "verificationStatus", "verifiedAt", "verificationMethod", "referenceEmail", "teamSize", budget, revenue, "displayOrder", "createdAt", "updatedAt") VALUES
('1a0e8400-e29b-41d4-a716-446655440001', '180e8400-e29b-41d4-a716-446655440001', 'StartupXYZ', 'https://startupxyz.com/logo.png', 'https://startupxyz.com', 'https://linkedin.com/company/startupxyz', '50-200', 'Technology', 'Senior Full-Stack Developer', 'FULL_TIME', 'Engineering', 'Austin, TX', true, '2022-01-01', NULL, true, 'Leading the development of the core product platform, implementing new features and improving performance.', ARRAY['Lead development of microservices architecture', 'Mentor junior developers', 'Code review and technical documentation'], ARRAY['Reduced API response time by 40%', 'Implemented CI/CD pipeline reducing deployment time by 60%', 'Led migration to TypeScript'], ARRAY['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes'], ARRAY['Technical Leadership', 'System Design', 'Agile'], 'VERIFIED', NOW(), 'email', 'manager@startupxyz.com', 8, NULL, NULL, 1, NOW(), NOW()),
('1a0e8400-e29b-41d4-a716-446655440002', '180e8400-e29b-41d4-a716-446655440001', 'BigTech Corp', NULL, 'https://bigtech.example.com', NULL, '10000+', 'Technology', 'Full-Stack Developer', 'FULL_TIME', 'Product Engineering', 'San Francisco, CA', false, '2019-06-01', '2021-12-31', false, 'Developed and maintained web applications serving millions of users.', ARRAY['Built RESTful APIs', 'Developed React components', 'Database optimization'], ARRAY['Achieved 99.9% uptime', 'Reduced load time by 30%'], ARRAY['React', 'Node.js', 'MongoDB', 'Redis'], ARRAY['Web Development', 'API Design'], 'PENDING', NULL, NULL, NULL, 12, NULL, NULL, 2, NOW(), NOW());

-- =============================================================================
-- 23. EDUCATIONS TABLE
-- =============================================================================
INSERT INTO educations (id, "profileId", "institutionName", "institutionLogo", "institutionWebsite", "institutionLocation", "institutionType", degree, "fieldOfStudy", specialization, "startDate", "endDate", "isOngoing", grade, "gradeScale", activities, achievements, thesis, "thesisDescription", "courseProjects", "verificationStatus", "verifiedAt", "verificationMethod", "certificateUrl", "displayOrder", "createdAt", "updatedAt") VALUES
('1b0e8400-e29b-41d4-a716-446655440001', '180e8400-e29b-41d4-a716-446655440001', 'University of Texas at Austin', 'https://utexas.edu/logo.png', 'https://utexas.edu', 'Austin, TX', 'Public University', 'Bachelor of Science', 'Computer Science', 'Software Engineering', '2014-09-01', '2018-05-15', false, '3.8', '4.0', ARRAY['ACM Student Chapter', 'Hackathon Club'], ARRAY['Dean''s List - 6 semesters', 'Best Senior Project Award'], 'Distributed Systems for Real-time Data Processing', 'Developed a distributed system for processing real-time sensor data using Apache Kafka and Spark.', '{"projects": [{"name": "E-commerce Platform", "description": "Full-stack e-commerce application"}]}', 'VERIFIED', NOW(), 'transcript', 'https://credentials.utexas.edu/verify/123', 1, NOW(), NOW()),
('1b0e8400-e29b-41d4-a716-446655440002', '180e8400-e29b-41d4-a716-446655440002', 'Rhode Island School of Design', NULL, 'https://risd.edu', 'Providence, RI', 'Private Art School', 'Bachelor of Fine Arts', 'Graphic Design', 'Digital Design', '2013-09-01', '2017-05-20', false, '3.9', '4.0', ARRAY['Design Club President'], ARRAY['Excellence in Design Award'], NULL, NULL, NULL, 'VERIFIED', NOW(), 'transcript', NULL, 1, NOW(), NOW());

-- =============================================================================
-- 24. CERTIFICATIONS TABLE
-- =============================================================================
INSERT INTO certifications (id, "profileId", name, "issuingOrganization", "organizationLogo", "organizationWebsite", "credentialId", "credentialUrl", "issueDate", "expirationDate", "doesNotExpire", description, skills, "verificationStatus", "verifiedAt", "verificationMethod", "displayOrder", "createdAt", "updatedAt") VALUES
('1c0e8400-e29b-41d4-a716-446655440001', '180e8400-e29b-41d4-a716-446655440001', 'AWS Certified Solutions Architect - Professional', 'Amazon Web Services', 'https://aws.amazon.com/logo.png', 'https://aws.amazon.com', 'AWS-SAP-123456', 'https://aws.amazon.com/verification/123456', '2023-01-15', '2026-01-15', false, 'Advanced AWS architecture certification covering complex cloud solutions.', ARRAY['AWS', 'Cloud Architecture', 'Distributed Systems'], 'VERIFIED', NOW(), 'online', 1, NOW(), NOW()),
('1c0e8400-e29b-41d4-a716-446655440002', '180e8400-e29b-41d4-a716-446655440002', 'Google UX Design Professional Certificate', 'Google', 'https://google.com/logo.png', 'https://grow.google/uxdesign', 'GUXD-789012', 'https://coursera.org/verify/789012', '2023-06-01', NULL, true, 'Comprehensive UX design program covering research, wireframing, and prototyping.', ARRAY['UX Design', 'User Research', 'Figma', 'Prototyping'], 'VERIFIED', NOW(), 'online', 1, NOW(), NOW());

-- =============================================================================
-- 25. CANDIDATE SKILLS TABLE
-- =============================================================================
INSERT INTO candidate_skills (id, "profileId", name, category, subcategory, "proficiencyLevel", "proficiencyLabel", "yearsOfExperience", "lastUsed", projects, certifications, "isVerified", "verifiedAt", "verificationMethod", "endorsementCount", tags, "isPrimary", "displayOrder", "createdAt", "updatedAt") VALUES
('1d0e8400-e29b-41d4-a716-446655440001', '180e8400-e29b-41d4-a716-446655440001', 'React', 'Frontend', 'JavaScript Frameworks', 9, 'EXPERT', 5.0, NOW(), ARRAY['E-commerce Platform', 'Dashboard Application'], ARRAY[]::TEXT[], true, NOW(), 'assessment', 25, ARRAY['javascript', 'web', 'frontend'], true, 1, NOW(), NOW()),
('1d0e8400-e29b-41d4-a716-446655440002', '180e8400-e29b-41d4-a716-446655440001', 'Node.js', 'Backend', 'Server-side JavaScript', 8, 'ADVANCED', 4.5, NOW(), ARRAY['API Gateway', 'Real-time Chat'], ARRAY[]::TEXT[], true, NOW(), 'assessment', 18, ARRAY['javascript', 'backend', 'server'], true, 2, NOW(), NOW()),
('1d0e8400-e29b-41d4-a716-446655440003', '180e8400-e29b-41d4-a716-446655440002', 'Figma', 'Design', 'UI Design Tools', 9, 'EXPERT', 4.0, NOW(), ARRAY['Design System', 'Mobile App'], ARRAY['Google UX Design'], true, NOW(), 'portfolio', 30, ARRAY['design', 'ui', 'prototyping'], true, 1, NOW(), NOW()),
('1d0e8400-e29b-41d4-a716-446655440004', '180e8400-e29b-41d4-a716-446655440002', 'User Research', 'UX', 'Research Methods', 8, 'ADVANCED', 3.5, NOW(), ARRAY['E-commerce Redesign'], ARRAY['Google UX Design'], true, NOW(), 'project', 15, ARRAY['ux', 'research', 'usability'], true, 2, NOW(), NOW());

-- =============================================================================
-- 26. SKILL ENDORSEMENTS TABLE
-- =============================================================================
INSERT INTO skill_endorsements (id, "skillId", "endorserId", "endorserName", "endorserTitle", "endorserCompany", "endorserLinkedin", relationship, comment, rating, "isVerified", "verifiedAt", "createdAt") VALUES
('1e0e8400-e29b-41d4-a716-446655440001', '1d0e8400-e29b-41d4-a716-446655440001', 'endorser-001', 'Sarah Johnson', 'Engineering Manager', 'StartupXYZ', 'https://linkedin.com/in/sarahjohnson', 'Manager', 'Jane is one of the best React developers I have worked with. Her component architecture is always clean and well-documented.', 5, true, NOW(), NOW()),
('1e0e8400-e29b-41d4-a716-446655440002', '1d0e8400-e29b-41d4-a716-446655440003', 'endorser-002', 'Tom Wilson', 'Product Designer', 'DesignHub', 'https://linkedin.com/in/tomwilson', 'Colleague', 'Mike has exceptional Figma skills. His design system work has been instrumental for our team.', 5, true, NOW(), NOW());

-- =============================================================================
-- 27. PROJECTS TABLE
-- =============================================================================
INSERT INTO projects (id, "profileId", title, "shortDescription", description, "projectType", status, "startDate", "endDate", "isOngoing", technologies, frameworks, languages, tools, "repositoryUrl", "liveUrl", "demoUrl", "documentationUrl", "thumbnailUrl", images, videos, role, "teamSize", contributions, impact, users, downloads, stars, forks, "workExperienceId", "isPublic", "isFeatured", "displayOrder", "createdAt", "updatedAt") VALUES
('1f0e8400-e29b-41d4-a716-446655440001', '180e8400-e29b-41d4-a716-446655440001', 'TaskFlow - Project Management Platform', 'A modern project management tool built with React and Node.js', 'TaskFlow is a comprehensive project management platform that helps teams collaborate effectively. Features include real-time updates, Kanban boards, time tracking, and team analytics.', 'Personal', 'completed', '2023-01-01', '2023-06-30', false, ARRAY['React', 'Node.js', 'PostgreSQL', 'Redis', 'WebSocket'], ARRAY['Express.js', 'Prisma', 'TailwindCSS'], ARRAY['TypeScript', 'JavaScript'], ARRAY['VS Code', 'Docker', 'GitHub Actions'], 'https://github.com/janedeveloper/taskflow', 'https://taskflow.demo.com', 'https://taskflow.demo.com/demo', 'https://taskflow.demo.com/docs', 'https://taskflow.demo.com/thumbnail.png', ARRAY['https://taskflow.demo.com/img1.png', 'https://taskflow.demo.com/img2.png'], ARRAY[]::TEXT[], 'Lead Developer', 1, ARRAY['Architecture design', 'Full-stack development', 'Deployment'], 'Used by 500+ users in beta', 500, NULL, 120, 25, NULL, true, true, 1, NOW(), NOW()),
('1f0e8400-e29b-41d4-a716-446655440002', '180e8400-e29b-41d4-a716-446655440002', 'Foodie App Design System', 'A comprehensive design system for food delivery applications', 'Created a complete design system for a food delivery app including components, icons, typography, and color palettes. The system ensures consistency across web and mobile platforms.', 'Client', 'completed', '2023-03-01', '2023-08-15', false, ARRAY['Figma'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['Figma', 'FigJam', 'Notion'], NULL, 'https://figma.com/@mikedesigner/foodie-design-system', NULL, 'https://foodie-docs.design.com', 'https://foodie-design.com/thumbnail.png', ARRAY['https://foodie-design.com/preview1.png'], ARRAY[]::TEXT[], 'Lead Designer', 3, ARRAY['Design system architecture', 'Component library', 'Documentation'], 'Reduced design-to-development time by 50%', NULL, 1200, NULL, NULL, NULL, true, true, 1, NOW(), NOW());

-- =============================================================================
-- 28. ACHIEVEMENTS TABLE
-- =============================================================================
INSERT INTO achievements (id, "profileId", title, description, type, category, "badgeIcon", "badgeColor", points, "currentProgress", "targetProgress", "isCompleted", "earnedAt", "createdAt") VALUES
('200e8400-e29b-41d4-a716-446655440001', '180e8400-e29b-41d4-a716-446655440001', 'Profile Champion', 'Completed profile to 85% or higher', 'profile_completion', 'profile', 'trophy', 'gold', 100, 85, 85, true, NOW(), NOW()),
('200e8400-e29b-41d4-a716-446655440002', '180e8400-e29b-41d4-a716-446655440002', 'Skill Master', 'Added 10+ verified skills to profile', 'skill_count', 'skills', 'star', 'blue', 50, 12, 10, true, NOW(), NOW());

-- =============================================================================
-- 29. PROFILE VERSIONS TABLE
-- =============================================================================
INSERT INTO profile_versions (id, "profileId", "versionNumber", "versionLabel", "profileSnapshot", changes, "changeSummary", "createdBy", "createdAt") VALUES
('210e8400-e29b-41d4-a716-446655440001', '180e8400-e29b-41d4-a716-446655440001', 1, 'Initial Version', '{"headline": "Full-Stack Developer", "skills": ["React", "Node.js"]}', '{"added": ["headline", "skills"]}', 'Initial profile creation', '550e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '30 days'),
('210e8400-e29b-41d4-a716-446655440002', '180e8400-e29b-41d4-a716-446655440001', 2, 'Updated Skills', '{"headline": "Senior Full-Stack Developer | React & Node.js Expert", "skills": ["React", "Node.js", "TypeScript", "AWS"]}', '{"modified": ["headline"], "added": ["TypeScript", "AWS"]}', 'Updated headline and added new skills', '550e8400-e29b-41d4-a716-446655440003', NOW());

-- =============================================================================
-- 30. GITHUB PROFILES TABLE
-- =============================================================================
INSERT INTO github_profiles (id, "profileId", "githubId", username, "displayName", "avatarUrl", "profileUrl", bio, company, location, blog, email, "publicRepos", "privateRepos", "totalStars", followers, following, gists, "totalContributions", "contributionsLastYear", "longestStreak", "currentStreak", "topLanguages", "pinnedRepos", "recentActivity", "contributionGraph", status, "accessToken", "refreshToken", "tokenExpiresAt", scopes, "lastSyncAt", "syncError", "autoSync", "connectedAt", "updatedAt") VALUES
('220e8400-e29b-41d4-a716-446655440001', '180e8400-e29b-41d4-a716-446655440001', 'gh-12345678', 'janedeveloper', 'Jane Developer', 'https://avatars.githubusercontent.com/u/12345678', 'https://github.com/janedeveloper', 'Full-stack developer passionate about open source', 'StartupXYZ', 'Austin, TX', 'https://janedeveloper.dev', 'jane@example.com', 45, 12, 350, 1200, 250, 15, 2500, 850, 120, 45, '{"TypeScript": 45, "JavaScript": 30, "Python": 15, "Go": 10}', '[{"name": "taskflow", "stars": 120}]', '[{"type": "PushEvent", "repo": "taskflow", "date": "2025-12-30"}]', NULL, 'CONNECTED', NULL, NULL, NULL, ARRAY['read:user', 'repo'], NOW(), NULL, true, NOW() - INTERVAL '6 months', NOW()),
('220e8400-e29b-41d4-a716-446655440002', '180e8400-e29b-41d4-a716-446655440002', 'gh-87654321', 'mikedesigner', 'Mike Designer', 'https://avatars.githubusercontent.com/u/87654321', 'https://github.com/mikedesigner', 'UI/UX Designer who codes', NULL, 'Seattle, WA', 'https://mikedesigner.design', 'mike@example.com', 15, 3, 50, 300, 100, 5, 400, 150, 30, 10, '{"JavaScript": 60, "CSS": 30, "HTML": 10}', NULL, NULL, NULL, 'CONNECTED', NULL, NULL, NULL, ARRAY['read:user'], NOW(), NULL, true, NOW() - INTERVAL '3 months', NOW());

-- =============================================================================
-- 31. GITHUB REPOSITORIES TABLE
-- =============================================================================
INSERT INTO github_repositories (id, "githubProfileId", "repoId", name, "fullName", description, language, languages, "htmlUrl", "cloneUrl", homepage, stars, forks, watchers, "openIssues", size, "hasWiki", "hasPages", "hasProjects", "hasDiscussions", topics, "isForked", "isFork", "isArchived", "isPrivate", "contributionCount", "lastContributionAt", role, "isShowcased", "isPinned", "displayOrder", "createdAt", "updatedAt", "pushedAt") VALUES
('230e8400-e29b-41d4-a716-446655440001', '220e8400-e29b-41d4-a716-446655440001', 'repo-001', 'taskflow', 'janedeveloper/taskflow', 'A modern project management platform built with React and Node.js', 'TypeScript', '{"TypeScript": 70, "JavaScript": 20, "CSS": 10}', 'https://github.com/janedeveloper/taskflow', 'https://github.com/janedeveloper/taskflow.git', 'https://taskflow.demo.com', 120, 25, 120, 5, 15000, true, true, true, false, ARRAY['react', 'nodejs', 'typescript', 'project-management'], false, false, false, false, 450, NOW(), 'owner', true, true, 1, NOW() - INTERVAL '1 year', NOW(), NOW()),
('230e8400-e29b-41d4-a716-446655440002', '220e8400-e29b-41d4-a716-446655440001', 'repo-002', 'react-components', 'janedeveloper/react-components', 'A collection of reusable React components with TypeScript support', 'TypeScript', '{"TypeScript": 85, "CSS": 15}', 'https://github.com/janedeveloper/react-components', 'https://github.com/janedeveloper/react-components.git', 'https://react-components.janedeveloper.dev', 85, 15, 85, 2, 8000, false, true, false, false, ARRAY['react', 'typescript', 'components', 'ui-library'], false, false, false, false, 200, NOW() - INTERVAL '7 days', 'owner', true, true, 2, NOW() - INTERVAL '6 months', NOW(), NOW() - INTERVAL '7 days');

-- =============================================================================
-- 32. LINKEDIN PROFILES TABLE
-- =============================================================================
INSERT INTO linkedin_profiles (id, "profileId", "linkedInId", "vanityName", "profileUrl", "firstName", "lastName", headline, summary, "profilePicture", "backgroundImage", location, country, "currentCompany", "currentTitle", industry, connections, "followersCount", positions, education, certifications, skills, recommendations, honors, publications, patents, courses, projects, "volunteerExperiences", status, "accessToken", "refreshToken", "tokenExpiresAt", scopes, "lastSyncAt", "syncError", "autoSync", "importWorkHistory", "importEducation", "importSkills", "importCertifications", "isVerified", "verifiedAt", "connectedAt", "updatedAt") VALUES
('240e8400-e29b-41d4-a716-446655440001', '180e8400-e29b-41d4-a716-446655440001', 'li-jane-123', 'janedeveloper', 'https://linkedin.com/in/janedeveloper', 'Jane', 'Developer', 'Senior Full-Stack Developer | React & Node.js Expert', 'Passionate about building scalable web applications', 'https://linkedin.com/photos/jane.jpg', NULL, 'Austin, Texas', 'United States', 'StartupXYZ', 'Senior Full-Stack Developer', 'Technology', 500, 800, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'CONNECTED', NULL, NULL, NULL, ARRAY['r_liteprofile', 'r_emailaddress'], NOW(), NULL, true, true, true, true, true, true, NOW(), NOW() - INTERVAL '6 months', NOW()),
('240e8400-e29b-41d4-a716-446655440002', '180e8400-e29b-41d4-a716-446655440002', 'li-mike-456', 'mikedesigner', 'https://linkedin.com/in/mikedesigner', 'Mike', 'Designer', 'UI/UX Designer | Creating Delightful Digital Experiences', 'Creative designer focused on user-centered design', 'https://linkedin.com/photos/mike.jpg', NULL, 'Seattle, Washington', 'United States', 'DesignHub Co.', 'Senior UI/UX Designer', 'Design', 350, 500, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'CONNECTED', NULL, NULL, NULL, ARRAY['r_liteprofile'], NOW(), NULL, true, true, true, true, true, true, NOW(), NOW() - INTERVAL '3 months', NOW());

-- =============================================================================
-- 33. ACHIEVEMENT DEFINITIONS TABLE
-- =============================================================================
INSERT INTO achievement_definitions (id, name, title, description, category, type, criteria, "targetValue", points, "badgeIcon", "badgeColor", tier, "isPublic", "isActive", "displayOrder", "createdAt", "updatedAt") VALUES
('250e8400-e29b-41d4-a716-446655440001', 'profile_champion', 'Profile Champion', 'Complete your profile to 85% or higher', 'profile', 'profile_completion', '{"field": "completenessScore", "operator": ">=", "value": 85}', 85, 100, 'trophy', '#FFD700', 'gold', true, true, 1, NOW(), NOW()),
('250e8400-e29b-41d4-a716-446655440002', 'first_application', 'First Step', 'Submit your first job application', 'engagement', 'application_count', '{"field": "applicationCount", "operator": ">=", "value": 1}', 1, 25, 'rocket', '#4CAF50', 'bronze', true, true, 2, NOW(), NOW());

-- =============================================================================
-- 34. STACK OVERFLOW PROFILES TABLE
-- =============================================================================
INSERT INTO stackoverflow_profiles (id, "profileId", "stackOverflowId", "displayName", "profileUrl", "avatarUrl", "websiteUrl", location, "aboutMe", reputation, "goldBadges", "silverBadges", "bronzeBadges", "totalBadges", "questionCount", "answerCount", "acceptedAnswerCount", "upVotes", "downVotes", "viewCount", "topTags", "topAnswers", "creationDate", "lastAccessDate", status, "accessToken", "tokenExpiresAt", "lastSyncAt", "syncError", "autoSync", "connectedAt", "updatedAt") VALUES
('260e8400-e29b-41d4-a716-446655440001', '180e8400-e29b-41d4-a716-446655440001', 'so-12345', 'janedeveloper', 'https://stackoverflow.com/users/12345/janedeveloper', 'https://stackoverflow.com/users/12345/avatar.png', 'https://janedeveloper.dev', 'Austin, TX', 'Full-stack developer passionate about helping others learn', 15000, 5, 25, 80, 110, 50, 350, 120, 8500, 150, 500000, '{"javascript": 1500, "react": 1200, "nodejs": 800}', '[{"id": 123, "score": 150, "title": "How to handle async in React"}]', '2015-03-15', NOW(), 'CONNECTED', NULL, NULL, NOW(), NULL, true, NOW() - INTERVAL '1 year', NOW()),
('260e8400-e29b-41d4-a716-446655440002', '180e8400-e29b-41d4-a716-446655440002', 'so-67890', 'mikedesigner', 'https://stackoverflow.com/users/67890/mikedesigner', 'https://stackoverflow.com/users/67890/avatar.png', 'https://mikedesigner.design', 'Seattle, WA', 'Designer who codes', 2500, 0, 5, 20, 25, 20, 45, 15, 1200, 30, 50000, '{"css": 800, "html": 500, "figma": 200}', NULL, '2018-06-20', NOW(), 'CONNECTED', NULL, NULL, NOW(), NULL, true, NOW() - INTERVAL '6 months', NOW());

-- =============================================================================
-- 35. CALENDAR INTEGRATIONS TABLE
-- =============================================================================
INSERT INTO calendar_integrations (id, "userId", provider, name, email, "isDefault", "isPrimary", "accessToken", "refreshToken", "tokenExpiry", scope, "syncEnabled", "syncDirection", "lastSyncAt", "syncStatus", "syncError", color, timezone, "showInAvailability", "externalCalendarId", "createdAt", "updatedAt") VALUES
('270e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'google', 'John Recruiter - Work Calendar', 'recruiter@manithpro.com', true, true, NULL, NULL, NULL, 'calendar.events', true, 'both', NOW(), 'synced', NULL, '#1a73e8', 'America/Los_Angeles', true, 'primary', NOW(), NOW()),
('270e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'google', 'Jane Developer - Personal', 'candidate@manithpro.com', true, true, NULL, NULL, NULL, 'calendar.events.readonly', true, 'both', NOW(), 'synced', NULL, '#34a853', 'America/Chicago', true, 'primary', NOW(), NOW());

-- =============================================================================
-- 36. CALENDAR EVENTS TABLE
-- =============================================================================
INSERT INTO calendar_events (id, "calendarId", "userId", title, description, location, "meetingLink", "startTime", "endTime", "allDay", timezone, "isRecurring", "recurrenceRule", status, visibility, "externalEventId", "interviewId", "applicationId", attendees, organizer, "syncStatus", "lastSyncAt", "createdAt", "updatedAt") VALUES
('280e8400-e29b-41d4-a716-446655440001', '270e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Interview: Jane Developer - Senior Full-Stack Developer', 'Technical interview for the Senior Full-Stack Developer position', NULL, 'https://meet.google.com/abc-defg-hij', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '1 hour', false, 'America/Los_Angeles', false, NULL, 'confirmed', 'default', 'google-event-001', 'aa0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '[{"email": "jane@example.com", "name": "Jane Developer", "status": "accepted"}]', '{"email": "recruiter@manithpro.com", "name": "John Recruiter"}', 'synced', NOW(), NOW(), NOW()),
('280e8400-e29b-41d4-a716-446655440002', '270e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Team Standup', 'Daily team standup meeting', NULL, 'https://meet.google.com/xyz-uvwx-rst', NOW() + INTERVAL '1 day' + INTERVAL '9 hours', NOW() + INTERVAL '1 day' + INTERVAL '9 hours 30 minutes', false, 'America/Los_Angeles', true, 'FREQ=DAILY;INTERVAL=1', 'confirmed', 'default', 'google-event-002', NULL, NULL, NULL, '{"email": "recruiter@manithpro.com", "name": "John Recruiter"}', 'synced', NOW(), NOW(), NOW());

-- =============================================================================
-- 37. NOTIFICATION PREFERENCES TABLE
-- =============================================================================
INSERT INTO notification_preferences (id, "userId", "emailEnabled", "pushEnabled", "smsEnabled", "inAppEnabled", "applicationUpdates", "interviewReminders", "messageNotifications", "jobAlerts", "systemAnnouncements", "marketingEmails", "weeklyDigest", "instantNotifications", "quietHoursStart", "quietHoursEnd", "timezone", "createdAt", "updatedAt") VALUES
('290e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', true, true, false, true, true, true, true, true, true, false, true, true, '22:00', '08:00', 'America/Chicago', NOW(), NOW()),
('290e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', true, true, false, true, true, true, true, false, true, false, false, true, NULL, NULL, 'America/Los_Angeles', NOW(), NOW());

-- =============================================================================
-- 38. AI SCREENING INTERVIEWS TABLE
-- =============================================================================
INSERT INTO ai_screening_interviews (id, "candidateId", "jobId", "applicationId", "recruiterId", status, "scheduledAt", "startedAt", "completedAt", duration, "totalQuestions", "questionsAnswered", "overallScore", "technicalScore", "communicationScore", "cultureFitScore", "experienceScore", "strengths", "weaknesses", "summary", "recommendation", "aiNotes", "candidateFeedback", "candidateRating", "videoUrl", "transcriptUrl", "createdAt", "updatedAt") VALUES
('2a0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'COMPLETED', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '45 minutes', 45, 10, 10, 85.5, 90.0, 82.0, 88.0, 82.0, ARRAY['Strong technical skills in React and Node.js', 'Excellent problem-solving abilities', 'Good communication skills'], ARRAY['Could improve on system design explanations', 'Limited experience with microservices'], 'Jane demonstrated strong technical abilities and good communication skills. Recommended for the next round of interviews.', 'STRONG_HIRE', 'Candidate showed deep understanding of React ecosystem. Answered all coding questions correctly.', 'The AI interview was smooth and the questions were relevant to the position.', 4, 'https://storage.example.com/interviews/video-001.mp4', 'https://storage.example.com/interviews/transcript-001.json', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('2a0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'SCHEDULED', NOW() + INTERVAL '2 days', NULL, NULL, NULL, 8, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NOW(), NOW());

-- =============================================================================
-- 39. QUESTION FLOWS TABLE
-- =============================================================================
INSERT INTO question_flows (id, "userId", "jobId", name, description, "isDefault", "isActive", version, "totalQuestions", "estimatedDuration", "createdAt", "updatedAt") VALUES
('2b0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Full-Stack Developer Technical Screen', 'Technical screening questions for full-stack developer candidates', true, true, 1, 10, 45, NOW(), NOW()),
('2b0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 'Designer Portfolio Review', 'Questions for reviewing designer portfolios and design process', true, true, 1, 8, 30, NOW(), NOW());

-- =============================================================================
-- 40. SCREENING QUESTIONS TABLE
-- =============================================================================
INSERT INTO screening_questions (id, "flowId", "questionText", "questionType", "expectedAnswerType", "timeLimit", "isRequired", "order", hints, "sampleAnswer", "scoringCriteria", "followUpQuestionIds", "tags", "difficultyLevel", "createdAt", "updatedAt") VALUES
('2c0e8400-e29b-41d4-a716-446655440001', '2b0e8400-e29b-41d4-a716-446655440001', 'Can you explain the difference between useMemo and useCallback hooks in React?', 'TECHNICAL', 'TEXT', 180, true, 1, ARRAY['Think about memoization', 'Consider when each is appropriate'], 'useMemo memoizes the result of a computation, while useCallback memoizes the function itself. useMemo is used when you have expensive calculations that should not run on every render, while useCallback is used to prevent unnecessary re-renders of child components that depend on function references.', '{"keywords": ["memoization", "performance", "re-render"], "minLength": 100}', NULL, ARRAY['react', 'hooks', 'performance'], 'INTERMEDIATE', NOW(), NOW()),
('2c0e8400-e29b-41d4-a716-446655440002', '2b0e8400-e29b-41d4-a716-446655440002', 'Walk us through your design process for a recent project.', 'BEHAVIORAL', 'TEXT', 300, true, 1, ARRAY['Include research, ideation, and iteration phases'], 'A good answer should cover: user research, problem definition, ideation/sketching, wireframing, prototyping, user testing, iteration, and handoff to development.', '{"keywords": ["research", "prototype", "iteration", "testing"], "minLength": 200}', NULL, ARRAY['design-process', 'ux', 'methodology'], 'INTERMEDIATE', NOW(), NOW());

-- =============================================================================
-- 41. SCREENING RESPONSES TABLE
-- =============================================================================
INSERT INTO screening_responses (id, "screeningId", "questionId", "userId", "responseText", "responseAudioUrl", "responseVideoUrl", "responseDuration", "startedAt", "completedAt", "aiScore", "aiAnalysis", "aiSentiment", "keywordsDetected", "strengthsIdentified", "improvementAreas", "manualScore", "manualFeedback", "scoredBy", "scoredAt", "createdAt", "updatedAt") VALUES
('2d0e8400-e29b-41d4-a716-446655440001', '2a0e8400-e29b-41d4-a716-446655440001', '2c0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'useMemo is used to memoize the result of an expensive computation. It takes a function and dependencies, and only recalculates when dependencies change. useCallback, on the other hand, memoizes the function itself. It is useful when passing callbacks to child components to prevent unnecessary re-renders. The key difference is that useMemo returns a value while useCallback returns a function.', NULL, NULL, 120, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '2 minutes', 92.0, 'Excellent explanation of both hooks with clear differentiation. Covered the main use cases correctly.', 'POSITIVE', ARRAY['memoization', 'performance', 're-render', 'dependencies'], ARRAY['Clear explanation', 'Good understanding of React internals'], ARRAY['Could mention edge cases'], NULL, NULL, NULL, NULL, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('2d0e8400-e29b-41d4-a716-446655440002', '2a0e8400-e29b-41d4-a716-446655440001', '2c0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'For my last project, I started with user research including interviews and surveys. Then I defined the problem statement and created user personas. After that, I did competitive analysis and began ideation with sketches. I created low-fidelity wireframes, then high-fidelity mockups in Figma. We did user testing with 5 participants and iterated based on feedback. Finally, I created a design system and handed off to developers with detailed specifications.', NULL, NULL, 240, NOW() - INTERVAL '3 days' + INTERVAL '5 minutes', NOW() - INTERVAL '3 days' + INTERVAL '9 minutes', 88.0, 'Comprehensive overview of design process with all key phases mentioned.', 'POSITIVE', ARRAY['research', 'persona', 'wireframe', 'prototype', 'testing', 'iteration'], ARRAY['Structured approach', 'User-centered process'], ARRAY['Could provide more specific metrics'], NULL, NULL, NULL, NULL, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days');

-- =============================================================================
-- 42. PUSH SUBSCRIPTIONS TABLE
-- =============================================================================
INSERT INTO push_subscriptions (id, "userId", endpoint, "p256dhKey", "authKey", "userAgent", "deviceType", "isActive", "lastUsedAt", "failureCount", "createdAt", "updatedAt") VALUES
('2e0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'https://fcm.googleapis.com/fcm/send/abc123...', 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XHhWZXEbI9kYIWLuRLw2uPw', 'auth-key-123', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', 'desktop', true, NOW(), 0, NOW(), NOW()),
('2e0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'https://fcm.googleapis.com/fcm/send/xyz789...', 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XHhWZXEbI9kYIWLuRLw2uPx', 'auth-key-456', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15', 'desktop', true, NOW(), 0, NOW(), NOW());

-- =============================================================================
-- 43. SCHEDULING LINKS TABLE
-- =============================================================================
INSERT INTO scheduling_links (id, "userId", slug, title, description, "meetingDuration", "bufferBefore", "bufferAfter", "availableDays", "availableHours", "timezone", "expiresAt", "maxBookings", "currentBookings", "isActive", "customQuestions", "confirmationMessage", metadata, "createdAt", "updatedAt") VALUES
('2f0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'john-recruiter-30min', '30 Minute Interview', 'Schedule a 30-minute initial interview with John', 30, 5, 5, ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], '{"start": "09:00", "end": "17:00"}', 'America/Los_Angeles', NOW() + INTERVAL '90 days', 50, 5, true, '[{"question": "What position are you interested in?", "required": true}]', 'Thank you for scheduling! You will receive a confirmation email shortly.', '{"jobId": "660e8400-e29b-41d4-a716-446655440001"}', NOW(), NOW()),
('2f0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'john-recruiter-60min', '60 Minute Technical Interview', 'Schedule a 60-minute technical interview', 60, 10, 10, ARRAY['monday', 'wednesday', 'friday'], '{"start": "10:00", "end": "16:00"}', 'America/Los_Angeles', NOW() + INTERVAL '60 days', 20, 2, true, '[{"question": "Please share your GitHub profile", "required": false}]', 'Your technical interview has been scheduled!', NULL, NOW(), NOW());

-- =============================================================================
-- 44. FUNNEL ANALYTICS TABLE
-- =============================================================================
INSERT INTO funnel_analytics (id, "jobId", "recruiterId", period, "periodStart", "periodEnd", "totalViews", "uniqueViews", "totalApplications", "screeningCount", "interviewCount", "offerCount", "hiredCount", "withdrawnCount", "rejectedCount", "viewToApplicationRate", "applicationToScreeningRate", "screeningToInterviewRate", "interviewToOfferRate", "offerAcceptanceRate", metadata, "createdAt", "updatedAt") VALUES
('300e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'MONTHLY', DATE_TRUNC('month', NOW()), DATE_TRUNC('month', NOW()) + INTERVAL '1 month', 500, 350, 45, 30, 15, 5, 2, 3, 10, 12.86, 66.67, 50.00, 33.33, 40.00, '{"source": {"linkedin": 200, "indeed": 150, "direct": 150}}', NOW(), NOW()),
('300e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'MONTHLY', DATE_TRUNC('month', NOW()), DATE_TRUNC('month', NOW()) + INTERVAL '1 month', 300, 220, 25, 18, 8, 3, 1, 2, 6, 11.36, 72.00, 44.44, 37.50, 33.33, '{"source": {"dribbble": 120, "linkedin": 100, "direct": 80}}', NOW(), NOW());

-- =============================================================================
-- 45. RECRUITER PERFORMANCE TABLE
-- =============================================================================
INSERT INTO recruiter_performance (id, "recruiterId", period, "periodStart", "periodEnd", "totalJobsManaged", "totalApplicationsReviewed", "totalInterviewsScheduled", "totalOffersExtended", "totalHires", "averageTimeToFill", "averageTimeToHire", "averageCostPerHire", "candidateSatisfactionScore", "hiringManagerSatisfactionScore", "responseRate", "averageResponseTime", "qualityOfHireScore", "diversityHiringRate", goals, achievements, "createdAt", "updatedAt") VALUES
('310e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'MONTHLY', DATE_TRUNC('month', NOW()), DATE_TRUNC('month', NOW()) + INTERVAL '1 month', 5, 120, 35, 8, 3, 25.5, 32.0, 4500.00, 4.5, 4.7, 95.0, 4.2, 4.3, 35.0, '{"hires": 5, "timeToFill": 30}', '{"topPerformer": true, "diversityGoalMet": true}', NOW(), NOW()),
('310e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'QUARTERLY', DATE_TRUNC('quarter', NOW()), DATE_TRUNC('quarter', NOW()) + INTERVAL '3 months', 12, 350, 95, 22, 10, 28.0, 35.5, 4200.00, 4.6, 4.8, 92.0, 5.1, 4.4, 38.0, '{"hires": 15, "timeToFill": 25}', '{"quarterlyBonus": true}', NOW(), NOW());

-- =============================================================================
-- 46. WORKFLOW AUTOMATIONS TABLE
-- =============================================================================
INSERT INTO workflow_automations (id, name, description, "triggerType", "triggerConfig", actions, conditions, "isActive", "executionCount", "lastExecutedAt", "createdBy", "createdAt", "updatedAt") VALUES
('320e8400-e29b-41d4-a716-446655440001', 'Auto-Acknowledge Applications', 'Automatically send acknowledgement email when a new application is received', 'APPLICATION_RECEIVED', '{"jobIds": ["all"]}', '[{"type": "SEND_EMAIL", "templateId": "ff0e8400-e29b-41d4-a716-446655440001", "delay": 0}]', '{"status": "PENDING"}', true, 150, NOW() - INTERVAL '1 hour', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
('320e8400-e29b-41d4-a716-446655440002', 'Interview Reminder', 'Send reminder 24 hours before scheduled interview', 'INTERVIEW_SCHEDULED', '{"reminderHours": 24}', '[{"type": "SEND_EMAIL", "templateId": "ff0e8400-e29b-41d4-a716-446655440002"}, {"type": "SEND_NOTIFICATION", "templateId": "100e8400-e29b-41d4-a716-446655440002"}]', '{"status": "SCHEDULED"}', true, 45, NOW() - INTERVAL '2 days', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW());

-- =============================================================================
-- 47. API KEYS TABLE
-- =============================================================================
INSERT INTO api_keys (id, name, "keyHash", "keyPrefix", permissions, "rateLimit", "rateLimitPeriod", "expiresAt", "lastUsedAt", "usageCount", "ipWhitelist", "isActive", "createdBy", "createdAt", "updatedAt") VALUES
('330e8400-e29b-41d4-a716-446655440001', 'Integration API Key', 'hashed_key_abc123...', 'mp_live_', ARRAY['jobs:read', 'jobs:write', 'applications:read'], 1000, 'HOURLY', NOW() + INTERVAL '1 year', NOW(), 5420, ARRAY[]::TEXT[], true, '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
('330e8400-e29b-41d4-a716-446655440002', 'Webhook API Key', 'hashed_key_xyz789...', 'mp_whk_', ARRAY['webhooks:manage'], 100, 'HOURLY', NOW() + INTERVAL '6 months', NOW() - INTERVAL '1 day', 320, ARRAY['192.168.1.0/24'], true, '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW());

-- =============================================================================
-- 48. WEBHOOK CONFIGS TABLE
-- =============================================================================
INSERT INTO webhook_configs (id, name, url, events, secret, headers, "retryConfig", "isActive", "lastTriggeredAt", "successCount", "failureCount", "createdBy", "createdAt", "updatedAt") VALUES
('340e8400-e29b-41d4-a716-446655440001', 'ATS Integration Webhook', 'https://ats.example.com/webhooks/manithpro', ARRAY['application.created', 'application.updated', 'interview.scheduled'], 'whsec_abc123secret...', '{"X-Custom-Header": "value"}', '{"maxRetries": 3, "backoffMs": 1000}', true, NOW() - INTERVAL '30 minutes', 450, 5, '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
('340e8400-e29b-41d4-a716-446655440002', 'Slack Notifications', '[REDACTED-SLACK-WEBHOOK]', ARRAY['application.created', 'interview.completed', 'offer.accepted'], 'whsec_slack123...', '{}', '{"maxRetries": 2, "backoffMs": 500}', true, NOW() - INTERVAL '2 hours', 200, 2, '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW());

-- =============================================================================
-- 49. MOBILE DEVICES TABLE
-- =============================================================================
INSERT INTO mobile_devices (id, "userId", "deviceId", "deviceType", "deviceName", "osVersion", "appVersion", "pushToken", "lastActiveAt", "isActive", metadata, "createdAt", "updatedAt") VALUES
('350e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'device-uuid-abc123', 'ios', 'Jane''s iPhone 15', 'iOS 17.2', '2.1.0', 'apns_token_abc123...', NOW(), true, '{"timezone": "America/Chicago", "locale": "en_US"}', NOW(), NOW()),
('350e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'device-uuid-xyz789', 'android', 'John''s Pixel 8', 'Android 14', '2.1.0', 'fcm_token_xyz789...', NOW(), true, '{"timezone": "America/Los_Angeles", "locale": "en_US"}', NOW(), NOW());

-- =============================================================================
-- 50. TENANTS TABLE (for multi-tenancy)
-- =============================================================================
INSERT INTO tenants (id, name, slug, domain, logo, "primaryColor", "secondaryColor", settings, "subscriptionPlan", "maxUsers", "maxJobs", "isActive", "createdAt", "updatedAt") VALUES
('360e8400-e29b-41d4-a716-446655440001', 'TechCorp Inc.', 'techcorp', 'techcorp.manithpro.com', 'https://techcorp.example.com/logo.png', '#1a73e8', '#34a853', '{"allowPublicJobs": true, "requireApproval": false}', 'ENTERPRISE', 100, 500, true, NOW(), NOW()),
('360e8400-e29b-41d4-a716-446655440002', 'DesignHub Co.', 'designhub', 'designhub.manithpro.com', 'https://designhub.example.com/logo.png', '#ff6b6b', '#feca57', '{"allowPublicJobs": true, "requireApproval": true}', 'PROFESSIONAL', 25, 100, true, NOW(), NOW());

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================
-- Run these queries to verify the seed data was inserted correctly:

-- SELECT COUNT(*) as user_count FROM users;
-- SELECT COUNT(*) as job_count FROM jobs;
-- SELECT COUNT(*) as application_count FROM applications;
-- SELECT COUNT(*) as interview_count FROM interviews;
-- SELECT COUNT(*) as notification_count FROM notifications;

-- =============================================================================
-- END OF SEED DATA
-- =============================================================================
