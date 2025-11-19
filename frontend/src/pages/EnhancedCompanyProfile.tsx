import React from 'react';
import { useParams } from 'react-router-dom';
import CompanyCulture from '../components/CompanyCulture';
import TeamGallery from '../components/TeamGallery';

const EnhancedCompanyProfile: React.FC = () => {
  const { name } = useParams<{ name: string }>();

  // Mock data - in production, fetch from API based on company name
  const company = {
    name: name || 'Tech Innovations Inc.',
    tagline: 'Building the future of technology',
    description: 'We are a leading technology company specializing in AI, cloud computing, and innovative software solutions. Our mission is to empower businesses through cutting-edge technology.',
    industry: 'Technology',
    size: '500-1000 employees',
    founded: '2010',
    location: 'San Francisco, CA',
    website: 'https://techinnovations.com',
    logo: 'https://via.placeholder.com/200x200?text=Logo',
    coverImage: 'https://via.placeholder.com/1200x400?text=Company+Cover',
  };

  const cultureVideos = [
    {
      id: '1',
      title: 'A Day in the Life',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      description: 'Experience a typical day at our San Francisco office',
      thumbnail: 'https://via.placeholder.com/640x360?text=Day+in+Life',
    },
    {
      id: '2',
      title: 'Our Values & Mission',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      description: 'Learn about what drives us and our commitment to innovation',
      thumbnail: 'https://via.placeholder.com/640x360?text=Values',
    },
    {
      id: '3',
      title: 'Office Tour',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      description: 'Take a virtual tour of our state-of-the-art facilities',
      thumbnail: 'https://via.placeholder.com/640x360?text=Office+Tour',
    },
    {
      id: '4',
      title: 'Team Building',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      description: 'See how we foster collaboration and camaraderie',
      thumbnail: 'https://via.placeholder.com/640x360?text=Team+Building',
    },
  ];

  const testimonials = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Senior Software Engineer',
      quote: 'Best company I\'ve ever worked for. The culture of innovation and the supportive team environment make coming to work a joy every day.',
      photo: 'https://via.placeholder.com/100x100?text=SJ',
      rating: 5,
    },
    {
      id: '2',
      name: 'Michael Chen',
      role: 'Product Manager',
      quote: 'The opportunities for growth here are incredible. I\'ve learned more in 2 years here than in my previous 5 years elsewhere.',
      photo: 'https://via.placeholder.com/100x100?text=MC',
      rating: 5,
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      role: 'UX Designer',
      quote: 'The work-life balance is excellent, and the company truly values creativity and diverse perspectives.',
      photo: 'https://via.placeholder.com/100x100?text=ER',
      rating: 5,
    },
    {
      id: '4',
      name: 'David Kim',
      role: 'DevOps Engineer',
      quote: 'Amazing benefits, cutting-edge technology, and a team that feels like family. Couldn\'t ask for more!',
      photo: 'https://via.placeholder.com/100x100?text=DK',
      rating: 4,
    },
  ];

  const perks = [
    {
      id: '1',
      title: 'Comprehensive Health Insurance',
      description: 'Medical, dental, and vision coverage for you and your family',
      icon: '🏥',
      category: 'health' as const,
    },
    {
      id: '2',
      title: 'Mental Health Support',
      description: 'Free counseling sessions and wellness programs',
      icon: '🧠',
      category: 'health' as const,
    },
    {
      id: '3',
      title: 'Learning & Development',
      description: '$5,000 annual budget for courses, conferences, and certifications',
      icon: '📚',
      category: 'learning' as const,
    },
    {
      id: '4',
      title: 'Tech Talks & Workshops',
      description: 'Weekly internal knowledge sharing sessions',
      icon: '🎯',
      category: 'learning' as const,
    },
    {
      id: '5',
      title: 'Flexible Work Hours',
      description: 'Work when you\'re most productive with core hours flexibility',
      icon: '⏰',
      category: 'lifestyle' as const,
    },
    {
      id: '6',
      title: 'Remote Work Options',
      description: 'Hybrid model with up to 3 days remote per week',
      icon: '🏡',
      category: 'lifestyle' as const,
    },
    {
      id: '7',
      title: 'Competitive Salary',
      description: 'Above market compensation with annual reviews',
      icon: '💰',
      category: 'financial' as const,
    },
    {
      id: '8',
      title: 'Stock Options',
      description: 'Equity participation in company success',
      icon: '📈',
      category: 'financial' as const,
    },
    {
      id: '9',
      title: 'Unlimited PTO',
      description: 'Take the time you need to recharge',
      icon: '🌴',
      category: 'lifestyle' as const,
    },
    {
      id: '10',
      title: 'Gym Membership',
      description: 'Free membership to local fitness centers',
      icon: '💪',
      category: 'health' as const,
    },
    {
      id: '11',
      title: '401(k) Matching',
      description: 'Up to 6% company match on retirement contributions',
      icon: '🏦',
      category: 'financial' as const,
    },
    {
      id: '12',
      title: 'Free Meals',
      description: 'Catered breakfast and lunch daily',
      icon: '🍽️',
      category: 'lifestyle' as const,
    },
  ];

  const teamMembers = [
    {
      id: '1',
      name: 'Jennifer Martinez',
      role: 'CEO & Founder',
      department: 'Executive',
      bio: 'Visionary leader with 20+ years in tech. Previously led product at major tech companies.',
      photo: 'https://via.placeholder.com/300x300?text=JM',
      linkedin: 'https://linkedin.com/in/jennifermartinez',
      email: 'jennifer@company.com',
    },
    {
      id: '2',
      name: 'Alex Thompson',
      role: 'CTO',
      department: 'Executive',
      bio: 'Technical genius passionate about scalable architectures and team mentorship.',
      photo: 'https://via.placeholder.com/300x300?text=AT',
      linkedin: 'https://linkedin.com/in/alexthompson',
    },
    {
      id: '3',
      name: 'Rachel Green',
      role: 'Head of Engineering',
      department: 'Engineering',
      bio: 'Leading our engineering team to build world-class products.',
      photo: 'https://via.placeholder.com/300x300?text=RG',
    },
    {
      id: '4',
      name: 'Marcus Williams',
      role: 'Senior Engineer',
      department: 'Engineering',
      bio: 'Full-stack developer with expertise in React, Node.js, and cloud infrastructure.',
      photo: 'https://via.placeholder.com/300x300?text=MW',
    },
    {
      id: '5',
      name: 'Lisa Anderson',
      role: 'Lead Designer',
      department: 'Design',
      bio: 'Creating beautiful, user-centered experiences that delight our customers.',
      photo: 'https://via.placeholder.com/300x300?text=LA',
    },
    {
      id: '6',
      name: 'Tom Baker',
      role: 'UX Researcher',
      department: 'Design',
      bio: 'Understanding user needs through research and data-driven insights.',
      photo: 'https://via.placeholder.com/300x300?text=TB',
    },
    {
      id: '7',
      name: 'Nina Patel',
      role: 'Product Manager',
      department: 'Product',
      bio: 'Driving product strategy and ensuring we build what customers need.',
      photo: 'https://via.placeholder.com/300x300?text=NP',
    },
    {
      id: '8',
      name: 'Chris Evans',
      role: 'Marketing Director',
      department: 'Marketing',
      bio: 'Telling our story and connecting with customers worldwide.',
      photo: 'https://via.placeholder.com/300x300?text=CE',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="relative h-96 bg-gradient-to-r from-primary-600 to-primary-700">
        <img
          src={company.coverImage}
          alt={company.name}
          className="w-full h-full object-cover opacity-50"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end gap-6">
              <div className="w-32 h-32 bg-white rounded-lg shadow-xl p-4 flex items-center justify-center">
                <img src={company.logo} alt={company.name} className="w-full h-full object-contain" loading="lazy" />
              </div>
              <div className="flex-1 text-white pb-2">
                <h1 className="text-5xl font-bold mb-2">{company.name}</h1>
                <p className="text-xl text-gray-200 mb-3">{company.tagline}</p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-full">{company.industry}</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full">{company.size}</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full">Founded {company.founded}</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full">📍 {company.location}</span>
                </div>
              </div>
              <div className="pb-2">
                <button className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold shadow-lg">
                  View Open Positions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* About Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About {company.name}</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">{company.description}</p>
          <div className="flex items-center gap-4">
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Visit Website
            </a>
          </div>
        </div>

        {/* Company Culture */}
        <div className="mb-8">
          <CompanyCulture
            videos={cultureVideos}
            testimonials={testimonials}
            perks={perks}
          />
        </div>

        {/* Team Gallery */}
        <div className="mb-8">
          <TeamGallery members={teamMembers} />
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join Our Team?</h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            We're always looking for talented individuals who are passionate about technology and innovation
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold text-lg">
              Browse Open Positions
            </button>
            <button className="px-8 py-4 bg-primary-500 text-white rounded-lg hover:bg-primary-400 transition-colors font-semibold text-lg">
              Learn More About Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCompanyProfile;
