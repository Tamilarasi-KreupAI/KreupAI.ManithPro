import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 text-slate-900 dark:text-white selection:bg-blue-500 selection:text-white transition-colors">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-900">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-60 dark:opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100 dark:bg-blue-900/30 blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-100 dark:bg-indigo-900/30 blur-[100px]" />
          <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-cyan-50 dark:bg-cyan-900/20 blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 mr-2 animate-pulse"></span>
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">The Future of Recruitment is Here</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-slate-900 dark:text-white">
              Find your dream job <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-800 dark:from-blue-400 dark:to-indigo-400">
                or perfect candidate
              </span>
            </h1>

            <p className="text-xl text-slate-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              ManithPro connects exceptional talent with world-class organizations using
              advanced AI matching technology. Experience the next generation of hiring.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {!user ? (
                <>
                  <Link
                    to="/register"
                    className="group relative px-8 py-4 bg-blue-600 rounded-xl font-semibold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    <span className="relative flex items-center gap-2">
                      Get Started Free
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-4 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl font-semibold text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-700 hover:border-slate-300 dark:hover:border-gray-600 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="group relative px-8 py-4 bg-blue-600 rounded-xl font-semibold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span className="flex items-center gap-2">
                    Go to Dashboard
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 -mt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Active Companies', value: '500+', icon: '🏢', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50' },
            { label: 'Talented Candidates', value: '10k+', icon: '👥', color: 'from-indigo-500 to-purple-500', bg: 'bg-indigo-50' },
            { label: 'Successful Matches', value: '25k+', icon: '🤝', color: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-50' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 p-8 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-gray-900/50 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-gray-900/70 transition-all group">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl mb-4 text-white shadow-lg group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{stat.value}</div>
              <div className="text-slate-500 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">
              Why choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-800 dark:from-blue-400 dark:to-indigo-400">ManithPro</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-gray-300 max-w-2xl mx-auto">
              We bring technology and human potential together to create perfect matches.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Smart Matching',
                desc: 'Our AI algorithms analyze skills, experience, and culture fit to find your perfect match instantly.',
                icon: '🎯',
                gradient: 'from-blue-50 to-indigo-50',
                border: 'border-blue-100'
              },
              {
                title: 'Verified Profiles',
                desc: 'Every candidate and company is verified to ensure a safe and professional environment.',
                icon: '✅',
                gradient: 'from-indigo-50 to-purple-50',
                border: 'border-indigo-100'
              },
              {
                title: 'Real-time Analytics',
                desc: 'Track applications, views, and engagement with detailed real-time dashboards.',
                icon: '📊',
                gradient: 'from-cyan-50 to-blue-50',
                border: 'border-cyan-100'
              },
            ].map((feature, idx) => (
              <div key={idx} className={`relative p-8 rounded-2xl bg-white dark:bg-gray-800 border ${feature.border} dark:border-gray-700 hover:shadow-xl transition-all group overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} dark:opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className="text-4xl mb-6">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-slate-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">How It Works</h2>
            <p className="text-lg text-slate-600 dark:text-gray-300">Simple steps to your next big opportunity</p>
          </div>
          <div className="grid gap-8 grid-cols-1 md:grid-cols-4">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up and build your professional profile' },
              { step: '02', title: 'Upload Resume', desc: 'Let our AI parse and enhance your CV' },
              { step: '03', title: 'Get Matched', desc: 'Receive tailored job recommendations' },
              { step: '04', title: 'Get Hired', desc: 'Connect with employers and start your new job' },
            ].map((item, idx) => (
              <div key={idx} className="relative p-6 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="text-5xl font-bold text-slate-100 dark:text-gray-800 absolute top-4 right-4">{item.step}</div>
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold mb-6">
                  {idx + 1}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 relative z-10">{item.title}</h3>
                <p className="text-slate-600 dark:text-gray-300 relative z-10">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-24 relative overflow-hidden bg-white dark:bg-gray-900">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-50 dark:bg-blue-900/20 rounded-full blur-[120px] -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-slate-900 dark:text-white">Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Software Engineer',
                content: "ManithPro helped me find a remote job that perfectly matches my skills. The AI matching is incredible!",
                avatar: '👩‍💻'
              },
              {
                name: 'Michael Chen',
                role: 'HR Director',
                content: "We reduced our hiring time by 50% using ManithPro. The quality of candidates is consistently high.",
                avatar: '👨‍💼'
              },
              {
                name: 'Emily Davis',
                role: 'Product Designer',
                content: "The interface is beautiful and easy to use. I love the salary insights feature!",
                avatar: '🎨'
              }
            ].map((testimonial, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 shadow-lg shadow-slate-100 dark:shadow-gray-900/50">
                <div className="text-4xl mb-6">{testimonial.avatar}</div>
                <p className="text-slate-600 dark:text-gray-300 italic mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-blue-600 dark:text-blue-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 px-4">
        <div className="max-w-5xl mx-auto relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/20">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-900" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

          <div className="relative z-10 px-8 py-16 md:py-20 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white dark:text-gray-100 mb-6">
              Ready to start your journey?
            </h2>
            <p className="text-xl text-blue-100 dark:text-blue-200 mb-10 max-w-2xl mx-auto">
              Join thousands of professionals who have already found their path with ManithPro.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register"
                className="px-8 py-4 bg-white text-blue-900 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg"
              >
                Get Started Now
              </Link>
              <Link
                to="/about"
                className="px-8 py-4 bg-blue-800 text-white rounded-xl font-bold text-lg hover:bg-blue-900 transition-colors border border-blue-700"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
