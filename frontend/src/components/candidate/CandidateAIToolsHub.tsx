import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ProfileEnhancement,
  ExperienceDescription,
  SkillsGapAnalysis,
  CoverLetter,
  InterviewPrep,
  SalaryNegotiationAdvice,
  ProfileSection,
  InterviewType,
  SeniorityLevel,
} from '../../types';
import {
  profileEnhancementAPI,
  experienceDescriptionAPI,
  skillsGapAPI,
  coverLetterAPI,
  interviewPrepAPI,
  salaryNegotiationAPI,
} from '../../services/batch13CandidateAIAPI';

type TabType = 'profile' | 'experience' | 'skills-gap' | 'cover-letter' | 'interview' | 'salary';

const CandidateAIToolsHub: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile Enhancement State
  const [profileForm, setProfileForm] = useState({
    profileSection: 'SUMMARY' as ProfileSection,
    currentContent: '',
  });
  const [enhancement, setEnhancement] = useState<ProfileEnhancement | null>(null);

  // Experience Description State
  const [experienceForm, setExperienceForm] = useState({
    jobTitle: '',
    companyName: '',
    industry: '',
    duration: '',
    responsibilities: '',
    technologies: '',
    achievements: '',
  });
  const [experienceDesc, setExperienceDesc] = useState<ExperienceDescription | null>(null);

  // Skills Gap State
  const [skillsForm, setSkillsForm] = useState({
    targetJobTitle: '',
    targetIndustry: '',
    targetSeniority: 'SENIOR' as SeniorityLevel,
    currentSkills: '',
  });
  const [skillsAnalysis, setSkillsAnalysis] = useState<SkillsGapAnalysis | null>(null);

  // Cover Letter State
  const [coverLetterForm, setCoverLetterForm] = useState({
    jobTitle: '',
    companyName: '',
    companyDescription: '',
    jobDescription: '',
    whyInterested: '',
    relevantExperience: '',
    keyAchievements: '',
  });
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null);

  // Interview Prep State
  const [interviewForm, setInterviewForm] = useState({
    jobTitle: '',
    companyName: '',
    interviewType: 'TECHNICAL' as InterviewType,
  });
  const [interviewPrep, setInterviewPrep] = useState<InterviewPrep | null>(null);

  // Salary Negotiation State
  const [salaryForm, setSalaryForm] = useState({
    jobTitle: '',
    companyName: '',
    location: '',
    industry: '',
    currentSalary: '',
    yearsExperience: '',
    offeredSalary: '',
    offeredBonus: '',
  });
  const [salaryAdvice, setSalaryAdvice] = useState<SalaryNegotiationAdvice | null>(null);

  // Handlers
  const handleEnhanceProfile = async () => {
    if (!profileForm.currentContent.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await profileEnhancementAPI.enhance(profileForm);
      setEnhancement(result);
    } catch (err: any) {
      setError(err.message || 'Failed to enhance profile');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateExperience = async () => {
    if (!experienceForm.jobTitle || !experienceForm.companyName) return;
    setLoading(true);
    setError(null);
    try {
      const result = await experienceDescriptionAPI.generate({
        ...experienceForm,
        responsibilities: experienceForm.responsibilities.split('\n').filter(Boolean),
        technologies: experienceForm.technologies.split(',').map(t => t.trim()).filter(Boolean),
        achievements: experienceForm.achievements.split('\n').filter(Boolean),
      });
      setExperienceDesc(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate experience description');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeSkillsGap = async () => {
    if (!skillsForm.targetJobTitle) return;
    setLoading(true);
    setError(null);
    try {
      const result = await skillsGapAPI.analyze({
        targetJobTitle: skillsForm.targetJobTitle,
        targetIndustry: skillsForm.targetIndustry || undefined,
        targetSeniority: skillsForm.targetSeniority,
        currentSkills: skillsForm.currentSkills.split(',').map(s => s.trim()).filter(Boolean),
      });
      setSkillsAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze skills gap');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!coverLetterForm.jobTitle || !coverLetterForm.companyName) return;
    setLoading(true);
    setError(null);
    try {
      const result = await coverLetterAPI.generate({
        ...coverLetterForm,
        relevantExperience: coverLetterForm.relevantExperience.split('\n').filter(Boolean),
        keyAchievements: coverLetterForm.keyAchievements.split('\n').filter(Boolean),
      });
      setCoverLetter(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate cover letter');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInterviewPrep = async () => {
    if (!interviewForm.jobTitle || !interviewForm.companyName) return;
    setLoading(true);
    setError(null);
    try {
      const result = await interviewPrepAPI.generate(interviewForm);
      setInterviewPrep(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate interview prep');
    } finally {
      setLoading(false);
    }
  };

  const handleGetSalaryAdvice = async () => {
    if (!salaryForm.jobTitle || !salaryForm.location || !salaryForm.yearsExperience) return;
    setLoading(true);
    setError(null);
    try {
      const result = await salaryNegotiationAPI.getAdvice({
        jobTitle: salaryForm.jobTitle,
        companyName: salaryForm.companyName || undefined,
        location: salaryForm.location,
        industry: salaryForm.industry || undefined,
        currentSalary: salaryForm.currentSalary ? Number(salaryForm.currentSalary) : undefined,
        yearsExperience: Number(salaryForm.yearsExperience),
        offeredSalary: salaryForm.offeredSalary ? Number(salaryForm.offeredSalary) : undefined,
        offeredBonus: salaryForm.offeredBonus ? Number(salaryForm.offeredBonus) : undefined,
      });
      setSalaryAdvice(result);
    } catch (err: any) {
      setError(err.message || 'Failed to get salary advice');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile Enhancer' },
    { id: 'experience' as TabType, label: 'Experience Writer' },
    { id: 'skills-gap' as TabType, label: 'Skills Gap' },
    { id: 'cover-letter' as TabType, label: 'Cover Letter' },
    { id: 'interview' as TabType, label: 'Interview Prep' },
    { id: 'salary' as TabType, label: 'Salary Advisor' },
  ];

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          AI Profile Enhancer
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Improve any section of your profile with AI-powered suggestions
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Profile Section
            </label>
            <select
              value={profileForm.profileSection}
              onChange={(e) => setProfileForm({ ...profileForm, profileSection: e.target.value as ProfileSection })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="SUMMARY">Professional Summary</option>
              <option value="EXPERIENCE">Experience</option>
              <option value="SKILLS">Skills</option>
              <option value="EDUCATION">Education</option>
              <option value="PROJECTS">Projects</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Content
            </label>
            <textarea
              value={profileForm.currentContent}
              onChange={(e) => setProfileForm({ ...profileForm, currentContent: e.target.value })}
              rows={6}
              placeholder="Paste your current profile content here..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <button
          onClick={handleEnhanceProfile}
          disabled={loading || !profileForm.currentContent.trim()}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Enhancing...' : 'Enhance Content'}
        </button>
      </div>

      {enhancement && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Enhancement Results</h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                +{enhancement.improvementPercentage.toFixed(0)}% improvement
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-red-500">{enhancement.originalScore}</div>
              <div className="text-xs text-gray-500">Original Score</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-green-500">{enhancement.potentialScore}</div>
              <div className="text-xs text-gray-500">Enhanced Score</div>
            </div>
            <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">+{enhancement.improvementPercentage.toFixed(0)}%</div>
              <div className="text-xs text-indigo-500">Improvement</div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Suggestions</h4>
            <div className="space-y-2">
              {enhancement.suggestions.map((s, idx) => (
                <div key={idx} className={`p-3 rounded-lg ${
                  s.priority === 'HIGH' ? 'bg-red-50 dark:bg-red-900/20' :
                  s.priority === 'MEDIUM' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                  'bg-blue-50 dark:bg-blue-900/20'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">{s.type.replace(/_/g, ' ')}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      s.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                      s.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>{s.priority}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{s.suggestion}</p>
                  {s.example && <p className="text-xs text-gray-500 mt-1 italic">{s.example}</p>}
                </div>
              ))}
            </div>
          </div>

          {enhancement.enhancedContent && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">Enhanced Version</h4>
              <p className="text-sm text-green-800 dark:text-green-300 whitespace-pre-wrap">
                {enhancement.enhancedContent}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Apply Enhancement
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              Copy to Clipboard
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderExperienceTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Experience Description Generator
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Generate impactful, ATS-optimized descriptions for your work experience
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title *</label>
            <input
              type="text"
              value={experienceForm.jobTitle}
              onChange={(e) => setExperienceForm({ ...experienceForm, jobTitle: e.target.value })}
              placeholder="e.g., Senior Software Engineer"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name *</label>
            <input
              type="text"
              value={experienceForm.companyName}
              onChange={(e) => setExperienceForm({ ...experienceForm, companyName: e.target.value })}
              placeholder="e.g., TechCorp Inc."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Industry</label>
            <input
              type="text"
              value={experienceForm.industry}
              onChange={(e) => setExperienceForm({ ...experienceForm, industry: e.target.value })}
              placeholder="e.g., Technology, Healthcare"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration</label>
            <input
              type="text"
              value={experienceForm.duration}
              onChange={(e) => setExperienceForm({ ...experienceForm, duration: e.target.value })}
              placeholder="e.g., 2 years 6 months"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Technologies (comma-separated)</label>
            <input
              type="text"
              value={experienceForm.technologies}
              onChange={(e) => setExperienceForm({ ...experienceForm, technologies: e.target.value })}
              placeholder="e.g., React, Node.js, AWS, PostgreSQL"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Key Achievements (one per line)</label>
            <textarea
              value={experienceForm.achievements}
              onChange={(e) => setExperienceForm({ ...experienceForm, achievements: e.target.value })}
              rows={3}
              placeholder="Led team of 5 engineers&#10;Improved system performance&#10;Launched new product feature"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <button
          onClick={handleGenerateExperience}
          disabled={loading || !experienceForm.jobTitle || !experienceForm.companyName}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Description'}
        </button>
      </div>

      {experienceDesc && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Generated Description</h3>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Impact: {experienceDesc.impactScore}%</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Clarity: {experienceDesc.clarityScore}%</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">ATS: {experienceDesc.atsScore}%</span>
            </div>
          </div>

          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Summary</h4>
            <p className="text-gray-700 dark:text-gray-300">{experienceDesc.generatedSummary}</p>
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Bullet Points</h4>
            <ul className="space-y-2">
              {experienceDesc.generatedBullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start text-gray-700 dark:text-gray-300">
                  <span className="text-indigo-500 mr-2">*</span>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">ATS Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {experienceDesc.atsKeywords.map((kw, idx) => (
                <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-sm rounded">
                  {kw}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Use This Description
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              Copy to Clipboard
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderSkillsGapTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Skills Gap Analyzer
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Identify skills you need to develop for your target role
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Job Title *</label>
            <input
              type="text"
              value={skillsForm.targetJobTitle}
              onChange={(e) => setSkillsForm({ ...skillsForm, targetJobTitle: e.target.value })}
              placeholder="e.g., Staff Software Engineer"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Seniority</label>
            <select
              value={skillsForm.targetSeniority}
              onChange={(e) => setSkillsForm({ ...skillsForm, targetSeniority: e.target.value as SeniorityLevel })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="ENTRY">Entry Level</option>
              <option value="MID">Mid Level</option>
              <option value="SENIOR">Senior</option>
              <option value="LEAD">Lead</option>
              <option value="EXECUTIVE">Executive</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Current Skills (comma-separated)</label>
            <input
              type="text"
              value={skillsForm.currentSkills}
              onChange={(e) => setSkillsForm({ ...skillsForm, currentSkills: e.target.value })}
              placeholder="e.g., JavaScript, React, Node.js, CSS, Git"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <button
          onClick={handleAnalyzeSkillsGap}
          disabled={loading || !skillsForm.targetJobTitle}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze Skills Gap'}
        </button>
      </div>

      {skillsAnalysis && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Skills Gap Analysis</h3>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">{skillsAnalysis.overallReadiness}%</div>
              <div className="text-xs text-indigo-500">Overall Readiness</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{skillsAnalysis.technicalReadiness}%</div>
              <div className="text-xs text-blue-500">Technical</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{skillsAnalysis.softSkillReadiness}%</div>
              <div className="text-xs text-green-500">Soft Skills</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{skillsAnalysis.experienceAlignment}%</div>
              <div className="text-xs text-purple-500">Experience</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Critical Gaps</h4>
              <div className="space-y-2">
                {skillsAnalysis.criticalGaps.map((gap, idx) => (
                  <div key={idx} className="p-2 bg-red-50 dark:bg-red-900/20 rounded flex justify-between">
                    <span className="text-red-800 dark:text-red-200">{gap.skill}</span>
                    <span className="text-xs text-red-600">{gap.level}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Important Gaps</h4>
              <div className="space-y-2">
                {skillsAnalysis.importantGaps.map((gap, idx) => (
                  <div key={idx} className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded flex justify-between">
                    <span className="text-yellow-800 dark:text-yellow-200">{gap.skill}</span>
                    <span className="text-xs text-yellow-600">{gap.level}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Learning Path</h4>
            <div className="space-y-2">
              {skillsAnalysis.learningPath.map((step) => (
                <div key={step.step} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center mr-3">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">{step.skill}</div>
                    <div className="text-xs text-gray-500">{step.duration}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    step.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                    step.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>{step.priority}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Recommended Resources</h4>
            <div className="space-y-2">
              {skillsAnalysis.resourceRecommendations.map((rec, idx) => (
                <div key={idx} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">{rec.resource}</span>
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">{rec.type}</span>
                  </div>
                  <div className="text-sm text-gray-500">{rec.skill}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCoverLetterTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Cover Letter Generator
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title *</label>
            <input
              type="text"
              value={coverLetterForm.jobTitle}
              onChange={(e) => setCoverLetterForm({ ...coverLetterForm, jobTitle: e.target.value })}
              placeholder="e.g., Senior Software Engineer"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name *</label>
            <input
              type="text"
              value={coverLetterForm.companyName}
              onChange={(e) => setCoverLetterForm({ ...coverLetterForm, companyName: e.target.value })}
              placeholder="e.g., TechCorp Inc."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Why are you interested?</label>
            <textarea
              value={coverLetterForm.whyInterested}
              onChange={(e) => setCoverLetterForm({ ...coverLetterForm, whyInterested: e.target.value })}
              rows={2}
              placeholder="What excites you about this role and company?"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Key Achievements (one per line)</label>
            <textarea
              value={coverLetterForm.keyAchievements}
              onChange={(e) => setCoverLetterForm({ ...coverLetterForm, keyAchievements: e.target.value })}
              rows={3}
              placeholder="Led team of 8 engineers&#10;Increased revenue by 25%&#10;Launched product to 1M users"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <button
          onClick={handleGenerateCoverLetter}
          disabled={loading || !coverLetterForm.jobTitle || !coverLetterForm.companyName}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Cover Letter'}
        </button>
      </div>

      {coverLetter && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Cover Letter</h3>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Relevance: {coverLetter.relevanceScore}%</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Persuasive: {coverLetter.persuasivenessScore}%</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">ATS: {coverLetter.atsScore}%</span>
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
            <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap">
              {coverLetter.fullLetter}
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Keywords Used</h4>
            <div className="flex flex-wrap gap-2">
              {coverLetter.keywordsUsed.map((kw, idx) => (
                <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">{kw}</span>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Save Cover Letter
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              Copy to Clipboard
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              Download PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderInterviewTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Interview Prep Coach
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title *</label>
            <input
              type="text"
              value={interviewForm.jobTitle}
              onChange={(e) => setInterviewForm({ ...interviewForm, jobTitle: e.target.value })}
              placeholder="e.g., Senior Software Engineer"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company *</label>
            <input
              type="text"
              value={interviewForm.companyName}
              onChange={(e) => setInterviewForm({ ...interviewForm, companyName: e.target.value })}
              placeholder="e.g., TechGiant Inc."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interview Type</label>
            <select
              value={interviewForm.interviewType}
              onChange={(e) => setInterviewForm({ ...interviewForm, interviewType: e.target.value as InterviewType })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="PHONE">Phone Screen</option>
              <option value="VIDEO">Video Interview</option>
              <option value="TECHNICAL">Technical</option>
              <option value="BEHAVIORAL">Behavioral</option>
              <option value="ONSITE">On-site</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleGenerateInterviewPrep}
          disabled={loading || !interviewForm.jobTitle || !interviewForm.companyName}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Preparing...' : 'Generate Prep Guide'}
        </button>
      </div>

      {interviewPrep && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Interview Prep: {interviewPrep.companyName}
            </h3>
            <div className="text-sm text-gray-500">
              Preparedness: {interviewPrep.preparednessScore || 0}%
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Preparation Checklist</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {interviewPrep.preparationChecklist.map((item, idx) => (
                <label key={idx} className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <input type="checkbox" className="mr-2 rounded" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Common Questions</h4>
            <div className="space-y-3">
              {interviewPrep.commonQuestions.slice(0, 5).map((q, idx) => (
                <div key={idx} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-indigo-600">{q.category}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      q.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                      q.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>{q.difficulty}</span>
                  </div>
                  <p className="text-gray-900 dark:text-white">{q.question}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Questions to Ask</h4>
            <ul className="space-y-2">
              {interviewPrep.questionsForInterviewer.map((q, idx) => (
                <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                  <span className="text-indigo-500 mr-2">*</span>
                  {q}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-4">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Things to Avoid</h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              {interviewPrep.thingsToAvoid.map((item, idx) => (
                <li key={idx}>* {item}</li>
              ))}
            </ul>
          </div>

          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Start Practice Session
          </button>
        </div>
      )}
    </div>
  );

  const renderSalaryTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Salary Negotiation Advisor
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title *</label>
            <input
              type="text"
              value={salaryForm.jobTitle}
              onChange={(e) => setSalaryForm({ ...salaryForm, jobTitle: e.target.value })}
              placeholder="e.g., Senior Software Engineer"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location *</label>
            <input
              type="text"
              value={salaryForm.location}
              onChange={(e) => setSalaryForm({ ...salaryForm, location: e.target.value })}
              placeholder="e.g., San Francisco, CA"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Years Experience *</label>
            <input
              type="number"
              value={salaryForm.yearsExperience}
              onChange={(e) => setSalaryForm({ ...salaryForm, yearsExperience: e.target.value })}
              placeholder="e.g., 5"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Salary</label>
            <input
              type="number"
              value={salaryForm.currentSalary}
              onChange={(e) => setSalaryForm({ ...salaryForm, currentSalary: e.target.value })}
              placeholder="e.g., 150000"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Offered Salary</label>
            <input
              type="number"
              value={salaryForm.offeredSalary}
              onChange={(e) => setSalaryForm({ ...salaryForm, offeredSalary: e.target.value })}
              placeholder="e.g., 175000"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Offered Bonus</label>
            <input
              type="number"
              value={salaryForm.offeredBonus}
              onChange={(e) => setSalaryForm({ ...salaryForm, offeredBonus: e.target.value })}
              placeholder="e.g., 15000"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <button
          onClick={handleGetSalaryAdvice}
          disabled={loading || !salaryForm.jobTitle || !salaryForm.location || !salaryForm.yearsExperience}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Get Salary Advice'}
        </button>
      </div>

      {salaryAdvice && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Negotiation Strategy
          </h3>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-xl font-bold text-red-600">${salaryAdvice.minimumAcceptable.toLocaleString()}</div>
              <div className="text-xs text-red-500">Walk-Away</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-xl font-bold text-yellow-600">${(salaryAdvice.offeredSalary || 0).toLocaleString()}</div>
              <div className="text-xs text-yellow-500">Current Offer</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-xl font-bold text-green-600">${salaryAdvice.targetSalary.toLocaleString()}</div>
              <div className="text-xs text-green-500">Target</div>
            </div>
            <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <div className="text-xl font-bold text-indigo-600">${salaryAdvice.anchorNumber.toLocaleString()}</div>
              <div className="text-xs text-indigo-500">First Ask</div>
            </div>
          </div>

          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Market Position</h4>
            <div className="flex items-center">
              <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full"
                  style={{ width: `${salaryAdvice.percentilePosition}%` }}
                />
              </div>
              <span className="ml-3 text-sm font-medium">{salaryAdvice.percentilePosition.toFixed(0)}th percentile</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Market range: ${salaryAdvice.marketData.minimum.toLocaleString()} - ${salaryAdvice.marketData.maximum.toLocaleString()}
            </p>
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Negotiation Script</h4>
            <div className="space-y-3">
              {Object.entries(salaryAdvice.negotiationScript).map(([key, value]) => (
                <div key={key} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-xs text-blue-600 font-medium mb-1">{key.toUpperCase()}</div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Leverage Points</h4>
            <ul className="space-y-1">
              {salaryAdvice.leveragePoints.map((point, idx) => (
                <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                  <span className="text-green-500 mr-2">+</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-green-800 dark:text-green-200 font-medium">Risk Level: {salaryAdvice.riskLevel}</span>
              <span className="text-xs text-green-600">Offer rescind risk: {salaryAdvice.offerRescindRisk}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            AI Career Tools
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            AI-powered tools to enhance your profile, prepare for interviews, and negotiate offers
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'experience' && renderExperienceTab()}
        {activeTab === 'skills-gap' && renderSkillsGapTab()}
        {activeTab === 'cover-letter' && renderCoverLetterTab()}
        {activeTab === 'interview' && renderInterviewTab()}
        {activeTab === 'salary' && renderSalaryTab()}
      </div>
    </div>
  );
};

export default CandidateAIToolsHub;
