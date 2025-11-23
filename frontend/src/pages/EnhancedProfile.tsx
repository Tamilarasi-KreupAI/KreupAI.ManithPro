import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// --- Icons ---
const Icons = {
  Briefcase: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  GraduationCap: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>,
  Code: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  Award: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Image: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Sparkles: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 3.214L13 21l-2.286-6.857L5 12l5.714-3.214L13 3z" /></svg>,
  CheckCircle: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  XCircle: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Mail: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Phone: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
  Link: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
  Edit: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
};

const EnhancedProfile: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');

  // --- Mock Data ---
  const [summary] = useState("Passionate Senior Full Stack Developer with over 8 years of experience in building scalable web applications. Expert in React, Node.js, and Cloud Architecture. Proven track record of leading teams and delivering high-impact projects.");

  const [experience] = useState([
    { id: 1, role: 'Senior Full Stack Developer', company: 'TechFlow Innovations', location: 'San Francisco, CA', period: 'Jan 2021 - Present', description: 'Leading the frontend migration to React and microservices architecture.', achievements: ['Reduced deployment time by 60%', 'Mentored 5 junior devs', 'Built real-time analytics dashboard'] },
    { id: 2, role: 'Software Engineer', company: 'Creative Solutions Inc.', location: 'Austin, TX', period: 'Jun 2018 - Dec 2020', description: 'Developed and maintained multiple client-facing e-commerce platforms.', achievements: ['Optimized DB queries (30% faster)', 'Integrated Stripe & PayPal', 'Collaborated with UX team'] }
  ]);

  const [skills] = useState([
    { name: 'React', level: 95 },
    { name: 'TypeScript', level: 90 },
    { name: 'Node.js', level: 85 },
    { name: 'AWS', level: 80 },
    { name: 'GraphQL', level: 75 },
    { name: 'Docker', level: 70 },
  ]);

  const [projects] = useState([
    { id: 1, title: 'E-commerce Dashboard', category: 'Web App', image: 'https://via.placeholder.com/400x200?text=Dashboard', impact: 'Increased admin efficiency by 40%' },
    { id: 2, title: 'Mobile Banking App', category: 'Mobile', image: 'https://via.placeholder.com/400x200?text=Mobile+App', impact: '4.8 Star Rating on App Store' },
  ]);

  // --- Components ---

  const NavItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button
      onClick={() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        setActiveSection(id);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeSection === id ? 'bg-white dark:bg-white/10 text-primary-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
    >
      <Icon />
      {label}
    </button>
  );

  const ContentCard = ({ title, children, className = "" }: { title?: string, children: React.ReactNode, className?: string }) => (
    <div className={`bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
      {title && <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-between group">
        {title}
        <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all text-gray-400">
          <Icons.Edit />
        </button>
      </h3>}
      {children}
    </div>
  );

  const SkillChip = ({ name, level }: { name: string, level: number }) => (
    <div className="group relative">
      <div className="px-4 py-2 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-primary-500 dark:hover:border-primary-500 transition-colors cursor-default flex items-center justify-between gap-3">
        {name}
        <div className="w-12 h-1 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 rounded-full" style={{ width: `${level}%` }}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:bg-[#000000] font-sans overflow-hidden text-gray-900 dark:text-white selection:bg-primary-500/30">

      {/* --- 1. Left Sidebar (Navigation & AI) --- */}
      <aside className="w-[280px] flex-shrink-0 flex flex-col p-6 border-r border-gray-200/50 dark:border-white/10 bg-white/50 dark:bg-[#1c1c1e]/50 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/20">M</div>
          <span className="font-bold text-xl tracking-tight">ManithPro</span>
        </div>

        <nav className="space-y-1 flex-1">
          <NavItem id="overview" icon={Icons.Sparkles} label="Overview" />
          <NavItem id="experience" icon={Icons.Briefcase} label="Experience" />
          <NavItem id="skills" icon={Icons.Code} label="Skills" />
          <NavItem id="projects" icon={Icons.Image} label="Projects" />
          <NavItem id="education" icon={Icons.GraduationCap} label="Education" />
        </nav>

        {/* AI Insights Widget */}
        <div className="mt-6 p-5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Icons.Sparkles />
          </div>
          <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">AI Insights</h4>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
            Your profile strength is <strong>High</strong>. Adding a video intro could boost visibility by 40%.
          </p>
          <button className="w-full py-2 bg-white dark:bg-white/10 text-xs font-semibold rounded-lg shadow-sm hover:shadow transition-all text-indigo-600 dark:text-white">
            Improve Profile
          </button>
        </div>
      </aside>

      {/* --- 2. Main Content Area (Editable Workspace) --- */}
      <main className="flex-1 overflow-y-auto scroll-smooth relative">
        <div className="w-full px-4 py-12 space-y-8">

          {/* Header / Overview */}
          <div id="overview" className="scroll-mt-12">
            <div className="relative mb-8 group">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 border-4 border-white dark:border-[#000] shadow-2xl flex items-center justify-center text-4xl overflow-hidden">
                {/* Placeholder Avatar */}
                <img src={`https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random`} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="mt-6">
                <h1 className="text-5xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-xl text-gray-500 dark:text-gray-400 font-medium mb-4">Senior Full Stack Developer</p>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 text-xs font-bold uppercase tracking-wide rounded-full border border-green-200 dark:border-green-500/30">
                    Open to Work
                  </span>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">San Francisco, CA (Remote)</span>
                </div>
              </div>
            </div>

            <ContentCard className="mb-8">
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                {summary}
              </p>
            </ContentCard>
          </div>

          {/* Experience Section */}
          <div id="experience" className="scroll-mt-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">Experience</h2>
            <div className="space-y-4">
              {experience.map((exp) => (
                <ContentCard key={exp.id} className="group cursor-pointer hover:scale-[1.01]">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{exp.role}</h3>
                      <p className="text-primary-600 dark:text-primary-400 font-medium">{exp.company}</p>
                    </div>
                    <span className="text-sm font-mono text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md">{exp.period}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{exp.description}</p>
                  <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Key Achievements</h4>
                    <ul className="space-y-2">
                      {exp.achievements.map((ach, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200">
                          <span className="mt-1 text-green-500"><Icons.CheckCircle /></span>
                          {ach}
                        </li>
                      ))}
                    </ul>
                  </div>
                </ContentCard>
              ))}
            </div>
          </div>

          {/* Skills Section */}
          <div id="skills" className="scroll-mt-12">
            <h2 className="text-2xl font-bold mb-6">Skills & Expertise</h2>
            <ContentCard>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, i) => (
                  <SkillChip key={i} name={skill.name} level={skill.level} />
                ))}
                <button className="px-4 py-2 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl text-sm font-medium text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-colors">
                  + Add Skill
                </button>
              </div>
            </ContentCard>
          </div>

          {/* Projects Section */}
          <div id="projects" className="scroll-mt-12">
            <h2 className="text-2xl font-bold mb-6">Featured Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="group relative bg-white dark:bg-[#1c1c1e] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-white/10">
                  <div className="h-48 bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
                    <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                    <span className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur text-white text-xs font-bold rounded-full">
                      {project.category}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{project.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
                      <span className="text-green-500"><Icons.Sparkles /></span>
                      {project.impact}
                    </p>
                    <button className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline">View Case Study →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* --- 3. Right Recruiter Panel --- */}
      <aside className="w-[320px] flex-shrink-0 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl border-l border-gray-200/50 dark:border-white/10 p-6 flex flex-col overflow-y-auto z-20">

        {/* Match Score */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-8 border-green-500/20 relative mb-3">
            <div className="absolute inset-0 rounded-full border-8 border-green-500 border-t-transparent rotate-45"></div>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">92%</span>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Match Score</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button className="py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-2">
            <Icons.CheckCircle /> Shortlist
          </button>
          <button className="py-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2">
            <Icons.XCircle /> Reject
          </button>
        </div>

        <hr className="border-gray-200 dark:border-white/10 mb-8" />

        {/* Contact Info */}
        <div className="space-y-4 mb-8">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Information</h4>
          <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
            <Icons.Mail />
            <span className="truncate">{user?.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
            <Icons.Phone />
            <span>+1 (555) 123-4567</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
            <Icons.Link />
            <a href="#" className="hover:text-primary-500 transition-colors">linkedin.com/in/profile</a>
          </div>
        </div>

        {/* Notes */}
        <div className="flex-1">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Recruiter Notes</h4>
          <textarea
            className="w-full h-32 bg-yellow-50 dark:bg-yellow-500/5 border border-yellow-200 dark:border-yellow-500/20 rounded-xl p-3 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
            placeholder="Add internal notes about this candidate..."
          ></textarea>
        </div>

      </aside>

    </div>
  );
};

export default EnhancedProfile;
