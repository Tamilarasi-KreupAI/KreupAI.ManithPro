-- =============================================================================
-- ManithPro Recruitment Portal - Simple Core Seed Data
-- =============================================================================

-- =============================================================================
-- 1. USERS TABLE (Core table - must be seeded first)
-- =============================================================================
INSERT INTO users (id, email, password, "firstName", "lastName", role, phone, bio, skills, experience, education, location, "linkedIn", portfolio, "createdAt", "updatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@manithpro.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4Tsl3yVmOgRqTlhW', 'Admin', 'User', 'ADMIN', '+1234567890', 'System administrator with full access', ARRAY['System Administration', 'User Management'], '10', 'Computer Science', 'New York, USA', 'https://linkedin.com/in/admin', 'https://admin.portfolio.com', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'recruiter@manithpro.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4Tsl3yVmOgRqTlhW', 'John', 'Recruiter', 'RECRUITER', '+1234567891', 'Senior Technical Recruiter specializing in software engineering', ARRAY['Talent Acquisition', 'Technical Recruiting', 'Sourcing'], '8', 'Human Resources', 'San Francisco, USA', 'https://linkedin.com/in/johnrecruiter', NULL, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'candidate@manithpro.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4Tsl3yVmOgRqTlhW', 'Jane', 'Developer', 'CANDIDATE', '+1234567892', 'Full-stack developer with 5 years of experience', ARRAY['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'TypeScript'], '5', 'Software Engineering', 'Austin, USA', 'https://linkedin.com/in/janedeveloper', 'https://github.com/janedeveloper', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'candidate2@manithpro.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4Tsl3yVmOgRqTlhW', 'Mike', 'Designer', 'CANDIDATE', '+1234567893', 'UI/UX Designer with expertise in design systems', ARRAY['Figma', 'Adobe XD', 'UI Design', 'UX Research', 'Prototyping'], '4', 'Graphic Design', 'Seattle, USA', 'https://linkedin.com/in/mikedesigner', 'https://dribbble.com/mikedesigner', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Password for all users: password123 (bcrypt hashed)

-- =============================================================================
-- 2. JOBS TABLE
-- =============================================================================
INSERT INTO jobs (id, title, description, requirements, responsibilities, location, type, salary, "salaryMin", "salaryMax", benefits, skills, experience, education, status, positions, deadline, "companyName", "companyDescription", "companyWebsite", "companyLogo", "companySize", "companyIndustry", "createdAt", "updatedAt", "postedById") VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Senior Full-Stack Developer', 'We are looking for an experienced Full-Stack Developer to join our growing engineering team.', ARRAY['5+ years of experience in web development', 'Strong proficiency in React and Node.js'], ARRAY['Design and implement new features', 'Write clean, maintainable code'], 'San Francisco, CA', 'FULL_TIME', '$120,000 - $180,000', 120000, 180000, ARRAY['Health Insurance', '401(k)', 'Remote Work'], ARRAY['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'], '5+ years', 'Bachelor''s in CS', 'OPEN', 2, NOW() + INTERVAL '30 days', 'TechCorp Inc.', 'Leading technology company', 'https://techcorp.example.com', 'https://techcorp.example.com/logo.png', '500-1000', 'Technology', NOW(), NOW(), '550e8400-e29b-41d4-a716-446655440002'),
('660e8400-e29b-41d4-a716-446655440002', 'UI/UX Designer', 'Join our design team to create beautiful and intuitive user experiences.', ARRAY['3+ years of UI/UX design experience', 'Proficiency in Figma'], ARRAY['Create wireframes and prototypes', 'Conduct user research'], 'Remote', 'REMOTE', '$90,000 - $130,000', 90000, 130000, ARRAY['Health Insurance', 'Remote Work', 'Learning Budget'], ARRAY['Figma', 'Adobe XD', 'User Research', 'Prototyping'], '3+ years', 'Bachelor''s in Design', 'OPEN', 1, NOW() + INTERVAL '45 days', 'DesignHub Co.', 'Award-winning design agency', 'https://designhub.example.com', 'https://designhub.example.com/logo.png', '50-200', 'Design', NOW(), NOW(), '550e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 3. APPLICATIONS TABLE
-- =============================================================================
INSERT INTO applications (id, resume, "coverLetter", status, notes, "appliedAt", "updatedAt", "jobId", "candidateId") VALUES
('770e8400-e29b-41d4-a716-446655440001', '/uploads/resumes/jane_developer_resume.pdf', 'I am excited to apply for the Senior Full-Stack Developer position.', 'REVIEWING', 'Strong candidate with relevant experience', NOW(), NOW(), '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003'),
('770e8400-e29b-41d4-a716-446655440002', '/uploads/resumes/mike_designer_resume.pdf', 'I am passionate about creating user-centered designs.', 'PENDING', NULL, NOW(), NOW(), '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 4. SAVED JOBS TABLE
-- =============================================================================
INSERT INTO saved_jobs (id, "userId", "jobId", "savedAt") VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', NOW()),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 5. INTERVIEWS TABLE
-- =============================================================================
INSERT INTO interviews (id, type, status, "scheduledAt", "endTime", "timeZone", "meetingLink", location, instructions, notes, feedback, rating, "createdAt", "updatedAt", "applicationId", "scheduledById", "candidateId") VALUES
('aa0e8400-e29b-41d4-a716-446655440001', 'TECHNICAL', 'SCHEDULED', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '1 hour', 'America/Los_Angeles', 'https://meet.google.com/abc-defg-hij', NULL, 'Please join 5 minutes early.', NULL, NULL, NULL, NOW(), NOW(), '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003'),
('aa0e8400-e29b-41d4-a716-446655440002', 'PHONE_SCREEN', 'SCHEDULED', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '30 minutes', 'America/New_York', NULL, NULL, 'Initial phone screening.', NULL, NULL, NULL, NOW(), NOW(), '770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 6. MESSAGES TABLE
-- =============================================================================
INSERT INTO messages (id, content, status, attachments, "createdAt", "updatedAt", "senderId", "receiverId", "applicationId") VALUES
('bb0e8400-e29b-41d4-a716-446655440001', 'Hi Jane, thank you for applying. We would like to schedule an interview.', 'DELIVERED', ARRAY[]::TEXT[], NOW(), NOW(), '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001'),
('bb0e8400-e29b-41d4-a716-446655440002', 'Hi Mike, we received your application. We will review your portfolio.', 'SENT', ARRAY[]::TEXT[], NOW(), NOW(), '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 7. NOTIFICATIONS TABLE
-- =============================================================================
INSERT INTO notifications (id, type, title, message, link, "isRead", "createdAt", "userId") VALUES
('cc0e8400-e29b-41d4-a716-446655440001', 'APPLICATION_RECEIVED', 'Application Received', 'Your application for Senior Full-Stack Developer has been received.', '/applications/770e8400-e29b-41d4-a716-446655440001', false, NOW(), '550e8400-e29b-41d4-a716-446655440003'),
('cc0e8400-e29b-41d4-a716-446655440002', 'INTERVIEW_SCHEDULED', 'Interview Scheduled', 'Your interview has been scheduled for next week.', '/interviews/aa0e8400-e29b-41d4-a716-446655440001', false, NOW(), '550e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 8. FAQs TABLE
-- =============================================================================
INSERT INTO faqs (id, question, answer, category, "order", "isPublished", views, helpful, "notHelpful", "createdAt", "updatedAt") VALUES
('ee0e8400-e29b-41d4-a716-446655440001', 'How do I create an account?', 'To create an account, click the "Sign Up" button on the homepage.', 'Getting Started', 1, true, 150, 45, 5, NOW(), NOW()),
('ee0e8400-e29b-41d4-a716-446655440002', 'How can I apply for a job?', 'Browse jobs using the search function, click on a job posting, then click "Apply Now".', 'Job Applications', 2, true, 200, 60, 8, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- VERIFICATION
-- =============================================================================
-- SELECT COUNT(*) as user_count FROM users;
-- SELECT COUNT(*) as job_count FROM jobs;
-- SELECT COUNT(*) as application_count FROM applications;
