import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const B2BRegister: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CLIENT',
    companyName: '',
    companyWebsite: '',
    companyEmail: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!formData.companyName.trim()) {
      setError('Company name is required.');
      return;
    }

    if (!formData.companyEmail.trim()) {
      setError('Company email is required.');
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        'http://localhost:5001/api/auth/register/b2b',
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          companyName: formData.companyName,
          companyWebsite: formData.companyWebsite,
          companyEmail: formData.companyEmail,
        }
      );

      setSuccess(
        `Registration submitted successfully. Your ${formData.role.toLowerCase()} account is pending admin approval.`
      );

      setTimeout(() => {
        navigate('/login', {
          state: {
            message:
              'Registration submitted. Please wait for admin approval before logging in.',
            email: formData.email,
          },
        });
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-gray-700">

        <div className="flex flex-col items-center mb-8">
          <Link to="/">
            <img
              src="/MANITHPRO.png"
              alt="ManithPro"
              className="h-20 w-auto mb-4"
            />
          </Link>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Client / Vendor Registration
          </h1>

          <p className="text-sm text-slate-500 dark:text-gray-400 mt-2 text-center">
            Register your company account for admin approval
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-xl">
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">
              {error}
            </p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-xl">
            <p className="text-sm text-green-700 dark:text-green-300 font-medium">
              {success}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
              Account Type
            </label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="CLIENT">Client</option>
              <option value="VENDOR">Vendor</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                First Name
              </label>

              <input
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                className="w-full px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                Last Name
              </label>

              <input
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                className="w-full px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
              Email
            </label>

            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                Password
              </label>

              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                className="w-full px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                Confirm Password
              </label>

              <input
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                className="w-full px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

          </div>

          <div className="border-t border-slate-200 dark:border-gray-600 pt-5">

            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Company Information
            </h2>

            <div className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                  Company Name
                </label>

                <input
                  name="companyName"
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Company Name"
                  className="w-full px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                  Company Email
                </label>

                <input
                  name="companyEmail"
                  type="email"
                  required
                  value={formData.companyEmail}
                  onChange={handleChange}
                  placeholder="company@example.com"
                  className="w-full px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                  Company Website (Optional)
                </label>

                <input
                  name="companyWebsite"
                  type="url"
                  value={formData.companyWebsite}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 font-bold shadow-lg transition-all"
          >
            {loading ? 'Submitting...' : 'Submit Registration'}
          </button>

          <div className="text-center">
            <p className="text-sm text-slate-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 dark:text-blue-400"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="text-center">
            <Link
              to="/register"
              className="text-sm text-slate-500 hover:text-blue-600"
            >
              Back to registration
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
};

export default B2BRegister;