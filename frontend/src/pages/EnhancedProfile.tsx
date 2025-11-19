import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import VideoIntroduction from '../components/VideoIntroduction';
import PortfolioGallery from '../components/PortfolioGallery';
import SkillsEndorsement from '../components/SkillsEndorsement';
import CertificationsShowcase from '../components/CertificationsShowcase';
import SocialIntegration from '../components/SocialIntegration';

const EnhancedProfile: React.FC = () => {
  const { user } = useAuth();

  // Mock data - in production, fetch from API
  const [videoUrl, setVideoUrl] = useState('https://www.w3schools.com/html/mov_bbb.mp4');

  const [portfolioItems, setPortfolioItems] = useState([
    {
      id: '1',
      type: 'image' as const,
      title: 'E-commerce Dashboard',
      description: 'Modern admin dashboard for e-commerce platform',
      url: 'https://via.placeholder.com/800x600?text=E-commerce+Dashboard',
    },
    {
      id: '2',
      type: 'video' as const,
      title: 'Mobile App Demo',
      description: 'React Native mobile application showcase',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    },
    {
      id: '3',
      type: 'image' as const,
      title: 'UI/UX Design',
      description: 'User interface designs for mobile app',
      url: 'https://via.placeholder.com/800x600?text=UI+Design',
    },
  ]);

  const [skills, setSkills] = useState([
    { name: 'React', endorsements: 24, endorsedBy: ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams', 'Charlie Brown', 'Diana Prince'] },
    { name: 'TypeScript', endorsements: 18, endorsedBy: ['Sarah Connor', 'Kyle Reese', 'Marcus Wright'] },
    { name: 'Node.js', endorsements: 15, endorsedBy: ['Tech Lead', 'Senior Dev', 'CTO'] },
    { name: 'Python', endorsements: 12, endorsedBy: ['Data Scientist', 'ML Engineer'] },
    { name: 'AWS', endorsements: 8, endorsedBy: ['DevOps Lead'] },
    { name: 'Docker', endorsements: 6, endorsedBy: ['Platform Team'] },
  ]);

  const [certifications, setCertifications] = useState([
    {
      id: '1',
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      issueDate: '2023-06-15',
      expiryDate: '2026-06-15',
      credentialId: 'AWS-SAA-123456',
      credentialUrl: 'https://aws.amazon.com/verification',
    },
    {
      id: '2',
      name: 'Professional Scrum Master I',
      issuer: 'Scrum.org',
      issueDate: '2022-03-20',
      credentialId: 'PSM-789012',
      credentialUrl: 'https://scrum.org/verify',
    },
    {
      id: '3',
      name: 'Google Cloud Professional',
      issuer: 'Google Cloud',
      issueDate: '2021-09-10',
      expiryDate: '2023-09-10', // Expired
      credentialId: 'GCP-456789',
    },
  ]);

  const [socialLinks, setSocialLinks] = useState({
    github: 'https://github.com/username',
    linkedin: 'https://linkedin.com/in/username',
    portfolio: 'https://myportfolio.com',
    twitter: 'https://twitter.com/username',
  });

  const handleAddPortfolioItem = (item: any) => {
    setPortfolioItems([...portfolioItems, item]);
  };

  const handleRemovePortfolioItem = (id: string) => {
    setPortfolioItems(portfolioItems.filter(item => item.id !== id));
  };

  const handleAddCertification = (cert: any) => {
    setCertifications([...certifications, cert]);
  };

  const handleRemoveCertification = (id: string) => {
    setCertifications(certifications.filter(cert => cert.id !== id));
  };

  const handleEndorse = (skillName: string) => {
    setSkills(skills.map(skill =>
      skill.name === skillName
        ? { ...skill, endorsements: skill.endorsements + 1 }
        : skill
    ));
  };

  const handleUpdateSocialLinks = (links: any) => {
    setSocialLinks(links);
  };

  const isOwnProfile = true; // In production, check if viewing own profile

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-primary-100 text-lg mb-3">{user?.bio || 'Professional Profile'}</p>
                <div className="flex flex-wrap gap-3 text-sm">
                  {user?.location && (
                    <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                      📍 {user.location}
                    </span>
                  )}
                  {user?.experience && (
                    <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                      💼 {user.experience} years experience
                    </span>
                  )}
                  {user?.education && (
                    <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                      🎓 {user.education}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button className="px-6 py-3 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Video Introduction */}
        <div className="mb-8">
          <VideoIntroduction
            videoUrl={videoUrl}
            editable={isOwnProfile}
            onUpdate={setVideoUrl}
          />
        </div>

        {/* Portfolio Gallery */}
        <div className="mb-8">
          <PortfolioGallery
            items={portfolioItems}
            editable={isOwnProfile}
            onAdd={handleAddPortfolioItem}
            onRemove={handleRemovePortfolioItem}
          />
        </div>

        {/* Skills & Endorsements */}
        <div className="mb-8">
          <SkillsEndorsement
            skills={skills}
            canEndorse={!isOwnProfile}
            onEndorse={handleEndorse}
          />
        </div>

        {/* Certifications */}
        <div className="mb-8">
          <CertificationsShowcase
            certifications={certifications}
            editable={isOwnProfile}
            onAdd={handleAddCertification}
            onRemove={handleRemoveCertification}
          />
        </div>

        {/* Social Integration */}
        <div className="mb-8">
          <SocialIntegration
            links={socialLinks}
            editable={isOwnProfile}
            onUpdate={handleUpdateSocialLinks}
          />
        </div>

        {/* Call to Action */}
        {!isOwnProfile && (
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Interested in working together?</h2>
            <p className="text-primary-100 mb-6">
              Let's connect and discuss how we can collaborate
            </p>
            <div className="flex gap-4 justify-center">
              <button className="px-8 py-3 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold">
                Send Message
              </button>
              <button className="px-8 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-400 transition-colors font-semibold">
                Invite to Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedProfile;
