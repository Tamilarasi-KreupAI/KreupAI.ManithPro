import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const RecruiterRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    companyName: '',
    companyWebsite: '',
    companyEmail: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: '' });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Name validation
    if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }
    if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }

    // Company validation
    if (formData.companyName.trim().length < 2) {
      errors.companyName = 'Company name is required';
    }
    if (!emailRegex.test(formData.companyEmail)) {
      errors.companyEmail = 'Please enter a valid company email';
    }

    // Phone validation (if provided)
    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registrationData } = formData;
      await authAPI.registerRecruiter(registrationData);
      setSuccess(true);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl border border-slate-100 dark:border-gray-700">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Registration Submitted!</h2>
            <p className="text-slate-600 dark:text-gray-400 mb-6">
              Your recruiter account is pending admin approval. You will receive an email once your account is approved.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>What happens next?</strong><br />
                Our team will review your application and verify your company details. This usually takes 1-2 business days.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/30 transition-all"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-lg w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl border border-slate-100 dark:border-gray-700">
        <div className="flex flex-col items-center">
          <Link to="/">
            <img
              src="/MANITHPRO.png"
              alt="ManithPro"
              className="h-20 w-auto mb-4"
            />
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Register as Recruiter</h2>
          <p className="text-center text-sm text-slate-500 dark:text-gray-400 mt-1">
            Create your recruiter account to start hiring
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 p-4 rounded-xl">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400 dark:text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Recruiter accounts require admin approval before you can access the platform.
              </p>
            </div>
          </div>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-3">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-xs font-medium text-slate-600 dark:text-gray-400 mb-1">First Name *</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className={`appearance-none block w-full px-3 py-2.5 border ${validationErrors.firstName ? 'border-red-500' : 'border-slate-200 dark:border-gray-600'} placeholder-slate-400 dark:placeholder-gray-500 text-slate-900 dark:text-white bg-white dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm`}
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                {validationErrors.firstName && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.firstName}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-xs font-medium text-slate-600 dark:text-gray-400 mb-1">Last Name *</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className={`appearance-none block w-full px-3 py-2.5 border ${validationErrors.lastName ? 'border-red-500' : 'border-slate-200 dark:border-gray-600'} placeholder-slate-400 dark:placeholder-gray-500 text-slate-900 dark:text-white bg-white dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm`}
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                />
                {validationErrors.lastName && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.lastName}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="email" className="block text-xs font-medium text-slate-600 dark:text-gray-400 mb-1">Email Address *</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`appearance-none block w-full px-3 py-2.5 border ${validationErrors.email ? 'border-red-500' : 'border-slate-200 dark:border-gray-600'} placeholder-slate-400 dark:placeholder-gray-500 text-slate-900 dark:text-white bg-white dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm`}
                placeholder="john.doe@company.com"
                value={formData.email}
                onChange={handleChange}
              />
              {validationErrors.email && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-slate-600 dark:text-gray-400 mb-1">Password *</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className={`appearance-none block w-full px-3 py-2.5 border ${validationErrors.password ? 'border-red-500' : 'border-slate-200 dark:border-gray-600'} placeholder-slate-400 dark:placeholder-gray-500 text-slate-900 dark:text-white bg-white dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm`}
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                />
                {validationErrors.password && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.password}</p>
                )}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-medium text-slate-600 dark:text-gray-400 mb-1">Confirm Password *</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className={`appearance-none block w-full px-3 py-2.5 border ${validationErrors.confirmPassword ? 'border-red-500' : 'border-slate-200 dark:border-gray-600'} placeholder-slate-400 dark:placeholder-gray-500 text-slate-900 dark:text-white bg-white dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm`}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {validationErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label htmlFor="phone" className="block text-xs font-medium text-slate-600 dark:text-gray-400 mb-1">Phone (Optional)</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className={`appearance-none block w-full px-3 py-2.5 border ${validationErrors.phone ? 'border-red-500' : 'border-slate-200 dark:border-gray-600'} placeholder-slate-400 dark:placeholder-gray-500 text-slate-900 dark:text-white bg-white dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm`}
                  placeholder="+1 234 567 8900"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-xs font-medium text-slate-600 dark:text-gray-400 mb-1">Location (Optional)</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  className="appearance-none block w-full px-3 py-2.5 border border-slate-200 dark:border-gray-600 placeholder-slate-400 dark:placeholder-gray-500 text-slate-900 dark:text-white bg-white dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  placeholder="City, Country"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="pt-4 border-t border-slate-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-3">Company Information</h3>

            <div>
              <label htmlFor="companyName" className="block text-xs font-medium text-slate-600 dark:text-gray-400 mb-1">Company Name *</label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                className={`appearance-none block w-full px-3 py-2.5 border ${validationErrors.companyName ? 'border-red-500' : 'border-slate-200 dark:border-gray-600'} placeholder-slate-400 dark:placeholder-gray-500 text-slate-900 dark:text-white bg-white dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm`}
                placeholder="Acme Corporation"
                value={formData.companyName}
                onChange={handleChange}
              />
              {validationErrors.companyName && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.companyName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label htmlFor="companyEmail" className="block text-xs font-medium text-slate-600 dark:text-gray-400 mb-1">Company Email *</label>
                <input
                  id="companyEmail"
                  name="companyEmail"
                  type="email"
                  required
                  className={`appearance-none block w-full px-3 py-2.5 border ${validationErrors.companyEmail ? 'border-red-500' : 'border-slate-200 dark:border-gray-600'} placeholder-slate-400 dark:placeholder-gray-500 text-slate-900 dark:text-white bg-white dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm`}
                  placeholder="hr@company.com"
                  value={formData.companyEmail}
                  onChange={handleChange}
                />
                {validationErrors.companyEmail && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.companyEmail}</p>
                )}
              </div>
              <div>
                <label htmlFor="companyWebsite" className="block text-xs font-medium text-slate-600 dark:text-gray-400 mb-1">Company Website (Optional)</label>
                <input
                  id="companyWebsite"
                  name="companyWebsite"
                  type="url"
                  className="appearance-none block w-full px-3 py-2.5 border border-slate-200 dark:border-gray-600 placeholder-slate-400 dark:placeholder-gray-500 text-slate-900 dark:text-white bg-white dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  placeholder="https://company.com"
                  value={formData.companyWebsite}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Registration'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                Sign in here
              </Link>
            </p>
            <p className="text-sm text-slate-600 dark:text-gray-400 mt-2">
              Want to apply for jobs?{' '}
              <Link to="/register" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                Register as Candidate
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecruiterRegister;
