import React, { useState, useEffect } from 'react';
import { verificationService, UserVerifications, VerificationType } from '../utils/verificationService';
import VerificationBadge from './VerificationBadge';
import TrustScoreBadge from './TrustScoreBadge';

interface VerificationPanelProps {
  userId: string;
  userEmail?: string;
  userPhone?: string;
}

const VerificationPanel: React.FC<VerificationPanelProps> = ({
  userId,
  userEmail,
  userPhone,
}) => {
  const [verifications, setVerifications] = useState<UserVerifications | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifyingType, setVerifyingType] = useState<VerificationType | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadVerifications();
  }, [userId]);

  const loadVerifications = async () => {
    setLoading(true);
    const data = await verificationService.getUserVerifications(userId);
    setVerifications(data);
    setLoading(false);
  };

  const handleSendVerification = async (type: 'EMAIL' | 'PHONE') => {
    setMessage(null);
    setVerifyingType(type);

    let result;
    if (type === 'EMAIL' && userEmail) {
      result = await verificationService.sendEmailVerification(userEmail);
    } else if (type === 'PHONE' && userPhone) {
      result = await verificationService.sendPhoneVerification(userPhone);
    } else {
      setMessage({ type: 'error', text: 'Missing contact information' });
      return;
    }

    setMessage({
      type: result.success ? 'success' : 'error',
      text: result.message,
    });
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setMessage({ type: 'error', text: 'Please enter the verification code' });
      return;
    }

    setMessage(null);
    let result;

    if (verifyingType === 'EMAIL') {
      result = await verificationService.verifyEmail(verificationCode);
    } else if (verifyingType === 'PHONE') {
      result = await verificationService.verifyPhone(verificationCode);
    } else {
      return;
    }

    setMessage({
      type: result.success ? 'success' : 'error',
      text: result.message,
    });

    if (result.success) {
      setVerifyingType(null);
      setVerificationCode('');
      await loadVerifications();
    }
  };

  const handleSocialVerification = async (type: 'LINKEDIN' | 'GITHUB') => {
    try {
      const result = type === 'LINKEDIN'
        ? await verificationService.verifyLinkedIn()
        : await verificationService.verifyGitHub();

      // Open OAuth popup
      window.open(result.authUrl, '_blank', 'width=600,height=700');
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Failed to initiate ${type} verification`,
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!verifications) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
        <p className="text-gray-600 dark:text-gray-400">Failed to load verification status</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
      {/* Header with Trust Score */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            Trust & Verification
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Verify your identity to build trust
          </p>
        </div>
        <TrustScoreBadge score={verifications.trustScore} size="lg" />
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Verification Items */}
      <div className="space-y-3">
        {/* Email Verification */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <VerificationBadge type="EMAIL" isVerified={verifications.email.isVerified} size="lg" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Email</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{userEmail || 'Not provided'}</p>
              </div>
            </div>
            {verifications.email.isVerified ? (
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                +20 points
              </span>
            ) : (
              <button
                onClick={() => handleSendVerification('EMAIL')}
                disabled={!userEmail}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Verify Email
              </button>
            )}
          </div>
          {verifyingType === 'EMAIL' && !verifications.email.isVerified && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white text-sm"
                maxLength={6}
              />
              <button
                onClick={handleVerifyCode}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Confirm
              </button>
            </div>
          )}
        </div>

        {/* Phone Verification */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <VerificationBadge type="PHONE" isVerified={verifications.phone.isVerified} size="lg" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Phone</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{userPhone || 'Not provided'}</p>
              </div>
            </div>
            {verifications.phone.isVerified ? (
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                +20 points
              </span>
            ) : (
              <button
                onClick={() => handleSendVerification('PHONE')}
                disabled={!userPhone}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Verify Phone
              </button>
            )}
          </div>
          {verifyingType === 'PHONE' && !verifications.phone.isVerified && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white text-sm"
                maxLength={6}
              />
              <button
                onClick={handleVerifyCode}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Confirm
              </button>
            </div>
          )}
        </div>

        {/* LinkedIn Verification */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <VerificationBadge
                type="LINKEDIN"
                isVerified={verifications.linkedin?.isVerified || false}
                size="lg"
              />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">LinkedIn</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Connect your professional profile</p>
              </div>
            </div>
            {verifications.linkedin?.isVerified ? (
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                +15 points
              </span>
            ) : (
              <button
                onClick={() => handleSocialVerification('LINKEDIN')}
                className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm font-medium"
              >
                Connect
              </button>
            )}
          </div>
        </div>

        {/* GitHub Verification */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <VerificationBadge
                type="GITHUB"
                isVerified={verifications.github?.isVerified || false}
                size="lg"
              />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">GitHub</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Verify your technical profile</p>
              </div>
            </div>
            {verifications.github?.isVerified ? (
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                +15 points
              </span>
            ) : (
              <button
                onClick={() => handleSocialVerification('GITHUB')}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium"
              >
                Connect
              </button>
            )}
          </div>
        </div>

        {/* Identity Verification */}
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <VerificationBadge
                type="IDENTITY"
                isVerified={verifications.identity?.isVerified || false}
                size="lg"
              />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  Identity Verification
                  <span className="text-xs px-2 py-0.5 bg-purple-600 text-white rounded-full">Premium</span>
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Government-issued ID verification</p>
              </div>
            </div>
            {verifications.identity?.isVerified ? (
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                +30 points
              </span>
            ) : (
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                Start Verification
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Trust Score Breakdown */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
          How to reach 100 points
        </h4>
        <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-300">
          <li className="flex justify-between">
            <span>• Email Verification</span>
            <span className="font-medium">20 points</span>
          </li>
          <li className="flex justify-between">
            <span>• Phone Verification</span>
            <span className="font-medium">20 points</span>
          </li>
          <li className="flex justify-between">
            <span>• LinkedIn Connection</span>
            <span className="font-medium">15 points</span>
          </li>
          <li className="flex justify-between">
            <span>• GitHub Connection</span>
            <span className="font-medium">15 points</span>
          </li>
          <li className="flex justify-between">
            <span>• Identity Verification</span>
            <span className="font-medium">30 points</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default VerificationPanel;
