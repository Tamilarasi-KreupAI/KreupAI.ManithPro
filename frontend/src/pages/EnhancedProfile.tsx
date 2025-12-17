import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { candidateProfileAPI } from '../services/candidateProfileAPI';
import type { CandidateProfile } from '../types';

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
  Sun: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Moon: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
};

const EnhancedProfile: React.FC = () => {
  const { user } = useAuth();
  const { actualTheme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('overview');
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await candidateProfileAPI.getProfile();
      setProfile(response.profile);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load profile');
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format date range for experience
  const formatDateRange = (startDate: string | Date | undefined, endDate: string | Date | null | undefined, isCurrent: boolean) => {
    if (!startDate) return 'Present';
    const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (isCurrent) return `${start} - Present`;
    if (!endDate) return start;
    const end = new Date(endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return `${start} - ${end}`;
  };

  // --- Components ---

  const NavItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button
      onClick={() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        setActiveSection(id);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeSection === id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
    >
      <Icon />
      {label}
    </button>
  );

  const ContentCard = ({ title, children, className = "" }: { title?: string, children: React.ReactNode, className?: string }) => (
    <div className={`bg-white dark:bg-[#18181b] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
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
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-primary-500 dark:hover:border-primary-500 transition-colors cursor-default flex items-center justify-between gap-3">
        {name}
        <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 rounded-full" style={{ width: `${level}%` }}></div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0a] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0a] items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Profile not found'}</p>
          <button
            onClick={loadProfile}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0a] font-sans overflow-hidden text-gray-900 dark:text-white selection:bg-primary-500/30">

      {/* --- 1. Left Sidebar (Navigation & AI) --- */}
      <aside className="w-[280px] flex-shrink-0 flex flex-col p-6 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111113] z-20">
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Navigation</h3>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
            aria-label="Toggle theme"
          >
            {actualTheme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
          </button>
        </div>

        <nav className="space-y-1 flex-1">
          <NavItem id="overview" icon={Icons.Sparkles} label="Overview" />
          <NavItem id="experience" icon={Icons.Briefcase} label="Experience" />
          <NavItem id="skills" icon={Icons.Code} label="Skills" />
          <NavItem id="projects" icon={Icons.Image} label="Projects" />
          <NavItem id="education" icon={Icons.GraduationCap} label="Education" />
        </nav>

        {/* AI Insights Widget */}
        {profile && (
          <div className="mt-6 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border border-indigo-200 dark:border-indigo-800 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Icons.Sparkles />
            </div>
            <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">Profile Completeness</h4>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{profile.completenessScore}%</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {profile.completenessScore >= 80 ? 'Excellent' : profile.completenessScore >= 60 ? 'Good' : profile.completenessScore >= 40 ? 'Fair' : 'Needs Work'}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${profile.completenessScore}%` }}
                ></div>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/profile/builder'}
              className="w-full py-2 bg-white dark:bg-gray-800 text-xs font-semibold rounded-lg shadow-sm hover:shadow transition-all text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700"
            >
              Improve Profile
            </button>
          </div>
        )}
      </aside>

      {/* --- 2. Main Content Area (Editable Workspace) --- */}
      <main className="flex-1 overflow-y-auto scroll-smooth relative bg-gray-50 dark:bg-[#0a0a0a] mt-5">
        <div className="w-full px-4 py-12 space-y-8 max-w-6xl mx-auto">

          {/* Header / Overview */}
          <div id="overview" className="scroll-mt-12">
            <div className="relative mb-8 group">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 border-4 border-white dark:border-gray-900 shadow-2xl flex items-center justify-center text-4xl overflow-hidden">
                {/* Placeholder Avatar */}
                <img src={`https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random`} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="mt-6">
                <h1 className="text-5xl font-bold tracking-tight mb-2 text-gray-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 font-medium mb-4">
                  {profile.headline || 'Professional'}
                </p>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wide rounded-full border border-green-200 dark:border-green-800">
                    {profile.isPublic ? 'Open to Work' : 'Private Profile'}
                  </span>
                  {(profile.city || profile.country) && (
                    <>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {[profile.city, profile.country].filter(Boolean).join(', ')}
                        {profile.remotePreference && ` (${profile.remotePreference})`}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {profile.summary && (
              <ContentCard className="mb-8">
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  {profile.summary}
                </p>
              </ContentCard>
            )}
          </div>

          {/* Experience Section */}
          <div id="experience" className="scroll-mt-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">Experience</h2>
            {profile.workExperiences && profile.workExperiences.length > 0 ? (
              <div className="space-y-4">
                {profile.workExperiences.map((exp) => (
                  <ContentCard key={exp.id} className="group cursor-pointer hover:scale-[1.01]">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{exp.title}</h3>
                        <p className="text-primary-600 dark:text-primary-400 font-medium">{exp.companyName}</p>
                        {exp.location && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{exp.location}</p>
                        )}
                      </div>
                      <span className="text-sm font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md">
                        {formatDateRange(exp.startDate, exp.endDate, exp.isCurrent)}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="text-gray-700 dark:text-gray-300 mb-4">{exp.description}</p>
                    )}
                    {(exp.achievements.length > 0 || exp.responsibilities.length > 0) && (
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                        {exp.achievements.length > 0 && (
                          <>
                            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Key Achievements</h4>
                            <ul className="space-y-2 mb-4">
                              {exp.achievements.map((ach, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                  <span className="mt-1 text-green-500 flex-shrink-0"><Icons.CheckCircle /></span>
                                  {ach}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                        {exp.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {exp.technologies.map((tech, i) => (
                              <span key={i} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-lg border border-blue-100 dark:border-blue-800">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </ContentCard>
                ))}
              </div>
            ) : (
              <ContentCard>
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No work experience added yet. Add your experience in the Profile Builder.
                </p>
              </ContentCard>
            )}
          </div>

          {/* Skills Section */}
          <div id="skills" className="scroll-mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Skills & Expertise</h2>
            <ContentCard>
              {profile.skills && profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {profile.skills.map((skill) => (
                    <SkillChip key={skill.id} name={skill.name} level={skill.proficiencyLevel * 10} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No skills added yet. Add your skills in the Profile Builder.
                </p>
              )}
            </ContentCard>
          </div>

          {/* Projects Section */}
          <div id="projects" className="scroll-mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Featured Projects</h2>
            {profile.projects && profile.projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.projects.map((project) => (
                  <div key={project.id} className="group relative bg-white dark:bg-[#18181b] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-800">
                    <div className="h-48 bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
                      {project.thumbnailUrl ? (
                        <img src={project.thumbnailUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Icons.Image />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      {project.projectType && (
                        <span className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur text-white text-xs font-bold rounded-full capitalize">
                          {project.projectType}
                        </span>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{project.title}</h3>
                      {project.shortDescription && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {project.shortDescription}
                        </p>
                      )}
                      {project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.technologies.slice(0, 3).map((tech, i) => (
                            <span key={i} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-lg border border-blue-100 dark:border-blue-800">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                      {(project.liveUrl || project.repositoryUrl) && (
                        <div className="flex gap-2">
                          {project.liveUrl && (
                            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                              View Live →
                            </a>
                          )}
                          {project.repositoryUrl && (
                            <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:underline">
                              Code →
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ContentCard>
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No projects added yet. Showcase your work in the Profile Builder.
                </p>
              </ContentCard>
            )}
          </div>

          {/* Education Section */}
          <div id="education" className="scroll-mt-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">Education</h2>
            {profile.educations && profile.educations.length > 0 ? (
              <div className="space-y-4">
                {profile.educations.map((edu) => (
                  <ContentCard key={edu.id} className="group cursor-pointer hover:scale-[1.01]">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{edu.degree}</h3>
                        <p className="text-primary-600 dark:text-primary-400 font-medium">{edu.institutionName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{edu.fieldOfStudy}</p>
                      </div>
                      <span className="text-sm font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md">
                        {formatDateRange(edu.startDate, edu.endDate, edu.isOngoing)}
                      </span>
                    </div>
                    {edu.grade && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <span className="font-semibold">Grade:</span> {edu.grade}
                      </p>
                    )}
                    {edu.achievements.length > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mt-3 border border-gray-100 dark:border-gray-800">
                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Achievements</h4>
                        <ul className="space-y-1">
                          {edu.achievements.map((ach, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <span className="mt-1 text-blue-500 flex-shrink-0"><Icons.Award /></span>
                              {ach}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </ContentCard>
                ))}
              </div>
            ) : (
              <ContentCard>
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No education added yet. Add your educational background in the Profile Builder.
                </p>
              </ContentCard>
            )}
          </div>
        </div>

      </main>


      {/* --- 3. Right Recruiter Panel --- */}
      {/* Only show recruiter panel if user is a recruiter */}
      {user?.role === 'RECRUITER' && (
        <aside className="w-[320px] flex-shrink-0 bg-white dark:bg-[#111113] border-l border-gray-200 dark:border-gray-800 p-6 flex flex-col overflow-y-auto z-20">

          {/* Match Score */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-8 border-green-500/20 dark:border-green-500/30 relative mb-3">
              <div className="absolute inset-0 rounded-full border-8 border-green-500 border-t-transparent rotate-45"></div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">92%</span>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Match Score</p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <button className="py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-2">
              <Icons.CheckCircle /> Shortlist
            </button>
            <button className="py-2.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 border border-red-200 dark:border-red-800">
              <Icons.XCircle /> Reject
            </button>
          </div>

          <hr className="border-gray-200 dark:border-gray-800 mb-8" />

          {/* Contact Info */}
          <div className="space-y-4 mb-8">
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact Information</h4>
            {profile.user?.email && (
              <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                <Icons.Mail />
                <span className="truncate">{profile.user.email}</span>
              </div>
            )}
            {profile.user?.phone && (
              <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                <Icons.Phone />
                <span>{profile.user.phone}</span>
              </div>
            )}
            {profile.linkedin && (
              <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                <Icons.Link />
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-primary-500 transition-colors truncate">
                  {profile.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              </div>
            )}
            {profile.github && (
              <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                <Icons.Link />
                <a href={profile.github} target="_blank" rel="noopener noreferrer" className="hover:text-primary-500 transition-colors truncate">
                  {profile.github.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="flex-1">
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Recruiter Notes</h4>
            <textarea
              className="w-full h-32 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-600 focus:border-transparent resize-none"
              placeholder="Add internal notes about this candidate..."
            ></textarea>
          </div>

        </aside>
      )}

    </div>
  );
};

export default EnhancedProfile;
