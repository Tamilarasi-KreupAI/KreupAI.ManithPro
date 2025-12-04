import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="bg-gradient-to-br from-slate-900 to-blue-900 text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div>
                        <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                            ManithPro
                        </h3>
                        <p className="text-blue-100/70 mb-6 leading-relaxed">
                            Connecting exceptional talent with world-class organizations. The future of recruitment is here.
                        </p>
                        <div className="flex space-x-4">
                            {/* Social Placeholders */}
                            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center hover:bg-blue-500 hover:border-blue-400 transition-all cursor-pointer text-blue-100 hover:text-white backdrop-blur-sm">
                                <span className="text-sm font-bold">in</span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center hover:bg-blue-500 hover:border-blue-400 transition-all cursor-pointer text-blue-100 hover:text-white backdrop-blur-sm">
                                <span className="text-sm font-bold">tw</span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center hover:bg-blue-500 hover:border-blue-400 transition-all cursor-pointer text-blue-100 hover:text-white backdrop-blur-sm">
                                <span className="text-sm font-bold">fb</span>
                            </div>
                        </div>
                    </div>

                    {/* Candidates Column */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-6">For Candidates</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link to="/jobs" className="text-blue-100/70 hover:text-white transition-colors">
                                    Browse Jobs
                                </Link>
                            </li>
                            <li>
                                <Link to="/register" className="text-blue-100/70 hover:text-white transition-colors">
                                    Create Profile
                                </Link>
                            </li>
                            <li>
                                <Link to="/salary-insights" className="text-blue-100/70 hover:text-white transition-colors">
                                    Salary Insights
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard" className="text-blue-100/70 hover:text-white transition-colors">
                                    Candidate Dashboard
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Employers Column */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-6">For Employers</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link to="/post-job" className="text-blue-100/70 hover:text-white transition-colors">
                                    Post a Job
                                </Link>
                            </li>
                            <li>
                                <Link to="/talent-search" className="text-blue-100/70 hover:text-white transition-colors">
                                    Browse Talent
                                </Link>
                            </li>
                            <li>
                                <Link to="/pricing" className="text-blue-100/70 hover:text-white transition-colors">
                                    Pricing Plans
                                </Link>
                            </li>
                            <li>
                                <Link to="/b2b" className="text-blue-100/70 hover:text-white transition-colors">
                                    Recruitment Solutions
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-6">Company</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link to="/about" className="text-blue-100/70 hover:text-white transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-blue-100/70 hover:text-white transition-colors">
                                    Contact Support
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="text-blue-100/70 hover:text-white transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="text-blue-100/70 hover:text-white transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-blue-100/50 text-sm">
                        © {new Date().getFullYear()} ManithPro. All rights reserved.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <span className="text-blue-100/50 text-sm">Made with ❤️ for Recruitment</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
