import React, { useState, useEffect } from 'react';
import {
  emailVerificationAPI,
  linkedInVerificationAPI,
  peerEndorsementAPI,
  managerReferenceAPI,
  certificationVerificationAPI,
  trustScoreAPI,
  verificationStatusAPI,
} from '../../services/verificationAPI';
import type {
  EmailDomainVerification,
  LinkedInEmploymentVerification,
  PeerEndorsement,
  ManagerReference,
  CertificationVerification,
  TrustScore,
  VerificationStatusSummary,
  EndorserRelationship,
  ReferenceRelationship,
} from '../../types';

type VerificationTab = 'overview' | 'email' | 'linkedin' | 'endorsements' | 'references' | 'certifications';

const VerificationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<VerificationTab>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [status, setStatus] = useState<VerificationStatusSummary | null>(null);
  const [trustScore, setTrustScore] = useState<TrustScore | null>(null);
  const [emailVerifications, setEmailVerifications] = useState<EmailDomainVerification[]>([]);
  const [linkedInVerifications, setLinkedInVerifications] = useState<LinkedInEmploymentVerification[]>([]);
  const [endorsements, setEndorsements] = useState<PeerEndorsement[]>([]);
  const [references, setReferences] = useState<ManagerReference[]>([]);
  const [certVerifications, setCertVerifications] = useState<CertificationVerification[]>([]);

  // Modal states
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showEndorsementModal, setShowEndorsementModal] = useState(false);
  const [showReferenceModal, setShowReferenceModal] = useState(false);
  const [showVerifyCodeModal, setShowVerifyCodeModal] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<EmailDomainVerification | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [
        statusRes,
        trustRes,
        emailRes,
        linkedInRes,
        endorsementsRes,
        referencesRes,
        certRes,
      ] = await Promise.all([
        verificationStatusAPI.get(),
        trustScoreAPI.get(),
        emailVerificationAPI.getAll(),
        linkedInVerificationAPI.getAll(),
        peerEndorsementAPI.getAll(),
        managerReferenceAPI.getAll(),
        certificationVerificationAPI.getAll(),
      ]);

      setStatus(statusRes.status);
      setTrustScore(trustRes.trustScore);
      setEmailVerifications(emailRes.verifications);
      setLinkedInVerifications(linkedInRes.verifications);
      setEndorsements(endorsementsRes.endorsements);
      setReferences(referencesRes.references);
      setCertVerifications(certRes.verifications);
    } catch (err: any) {
      setError(err.message || 'Failed to load verification data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview' as VerificationTab, label: 'Overview', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { id: 'email' as VerificationTab, label: 'Email', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { id: 'linkedin' as VerificationTab, label: 'LinkedIn', icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z' },
    { id: 'endorsements' as VerificationTab, label: 'Endorsements', icon: 'M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5' },
    { id: 'references' as VerificationTab, label: 'References', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'certifications' as VerificationTab, label: 'Certifications', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'from-gray-300 to-gray-500 text-gray-800';
      case 'gold': return 'from-yellow-400 to-yellow-600 text-yellow-900';
      case 'silver': return 'from-gray-300 to-gray-400 text-gray-700';
      case 'bronze': return 'from-amber-600 to-amber-800 text-amber-100';
      default: return 'from-gray-200 to-gray-300 text-gray-600';
    }
  };

  const getStatusBadge = (status: string, isVerified: boolean) => {
    if (isVerified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Verified
        </span>
      );
    }
    switch (status) {
      case 'SENT':
      case 'PENDING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
      case 'EXPIRED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Expired</span>;
      case 'FAILED':
      case 'DECLINED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Failed</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadAllData}
          className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verification & Trust</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Build credibility with verified credentials and endorsements
            </p>
          </div>
          {trustScore && (
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${getTierColor(trustScore.tier)}`}>
                <span className="text-2xl font-bold">{Math.round(trustScore.overallScore)}</span>
              </div>
              <p className="mt-1 text-sm font-medium capitalize text-gray-600 dark:text-gray-300">
                {trustScore.tier} Tier
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-4 px-4" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && status && (
            <div className="space-y-6">
              {/* Trust Score Breakdown */}
              {trustScore && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Email Verified</span>
                      <span className="text-lg font-semibold text-green-600">{trustScore.verifiedEmails}</span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(trustScore.emailVerificationScore / 20) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Endorsements</span>
                      <span className="text-lg font-semibold text-blue-600">{trustScore.endorsementsReceived}</span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(trustScore.endorsementScore / 20) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">References</span>
                      <span className="text-lg font-semibold text-purple-600">{trustScore.referencesReceived}</span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${(trustScore.referenceScore / 20) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Certifications</span>
                      <span className="text-lg font-semibold text-yellow-600">{trustScore.verifiedCertifications}</span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500 rounded-full"
                        style={{ width: `${(trustScore.certificationScore / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Verification Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Email Verifications */}
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Email Verification</h3>
                    <span className="text-2xl font-bold text-green-600">
                      {status.emailVerifications.verified}/{status.emailVerifications.total}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Verify your work email addresses to prove employment history
                  </p>
                  <button
                    onClick={() => setShowEmailModal(true)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Verify New Email
                  </button>
                </div>

                {/* Peer Endorsements */}
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Peer Endorsements</h3>
                    <span className="text-2xl font-bold text-blue-600">
                      {status.peerEndorsements.received}/{status.peerEndorsements.total}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Get endorsed by colleagues who can vouch for your skills
                  </p>
                  <button
                    onClick={() => setShowEndorsementModal(true)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Request Endorsement
                  </button>
                </div>

                {/* Manager References */}
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Manager References</h3>
                    <span className="text-2xl font-bold text-purple-600">
                      {status.managerReferences.completed}/{status.managerReferences.total}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Request references from managers and supervisors
                  </p>
                  <button
                    onClick={() => setShowReferenceModal(true)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Request Reference
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Verifications</h3>
                <div className="space-y-3">
                  {emailVerifications.slice(0, 2).map((v) => (
                    <div key={v.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{v.companyName}</p>
                          <p className="text-sm text-gray-500">{v.workEmail}</p>
                        </div>
                      </div>
                      {getStatusBadge(v.verificationStatus, v.isVerified)}
                    </div>
                  ))}
                  {endorsements.filter((e) => e.requestStatus === 'ACCEPTED').slice(0, 2).map((e) => (
                    <div key={e.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Endorsement from {e.endorserName}</p>
                          <p className="text-sm text-gray-500">{e.endorserTitle} at {e.endorserCompany}</p>
                        </div>
                      </div>
                      {getStatusBadge(e.requestStatus, e.isVerified)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Email Verifications Tab */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email Domain Verifications</h3>
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Verify New Email
                </button>
              </div>

              {emailVerifications.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">No email verifications yet</p>
                  <p className="text-sm text-gray-400">Verify your work email to prove your employment history</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {emailVerifications.map((verification) => (
                    <div key={verification.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{verification.companyName}</h4>
                          <p className="text-sm text-gray-500">{verification.workEmail}</p>
                          <p className="text-xs text-gray-400 mt-1">Domain: {verification.emailDomain}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(verification.verificationStatus, verification.isVerified)}
                          {!verification.isVerified && verification.verificationStatus === 'SENT' && (
                            <button
                              onClick={() => {
                                setSelectedVerification(verification);
                                setShowVerifyCodeModal(true);
                              }}
                              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              Enter Code
                            </button>
                          )}
                        </div>
                      </div>
                      {verification.isVerified && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <p className="text-sm text-green-600">
                            Verified on {formatDate(verification.verifiedAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* LinkedIn Verifications Tab */}
          {activeTab === 'linkedin' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">LinkedIn Employment Verification</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Cross-reference your work experience with your LinkedIn profile
              </p>

              {linkedInVerifications.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                  </svg>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">No LinkedIn verifications yet</p>
                  <p className="text-sm text-gray-400">Connect your LinkedIn profile to enable verification</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {linkedInVerifications.map((verification) => (
                    <div key={verification.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{verification.claimedCompanyName}</h4>
                          <p className="text-sm text-gray-500">{verification.claimedTitle}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(verification.claimedStartDate)} - {verification.claimedIsCurrent ? 'Present' : formatDate(verification.claimedEndDate)}
                          </p>
                        </div>
                        {getStatusBadge(verification.verificationStatus, verification.isVerified)}
                      </div>
                      {verification.isVerified && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Company: </span>
                              <span className={`font-medium ${verification.companyNameMatch === 'exact' ? 'text-green-600' : 'text-yellow-600'}`}>
                                {verification.companyNameMatch}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Title: </span>
                              <span className={`font-medium ${verification.titleMatch === 'exact' ? 'text-green-600' : 'text-yellow-600'}`}>
                                {verification.titleMatch}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Dates: </span>
                              <span className={`font-medium ${verification.dateMatch === 'exact' ? 'text-green-600' : 'text-yellow-600'}`}>
                                {verification.dateMatch}
                              </span>
                            </div>
                          </div>
                          {verification.matchScore && (
                            <div className="mt-2">
                              <span className="text-gray-500 text-sm">Match Score: </span>
                              <span className="font-semibold text-green-600">{verification.matchScore}%</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Endorsements Tab */}
          {activeTab === 'endorsements' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Peer Endorsements</h3>
                <button
                  onClick={() => setShowEndorsementModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Request Endorsement
                </button>
              </div>

              {endorsements.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">No endorsements yet</p>
                  <p className="text-sm text-gray-400">Request endorsements from colleagues to boost your credibility</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {endorsements.map((endorsement) => (
                    <div key={endorsement.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <span className="text-lg font-semibold text-blue-600">
                              {endorsement.endorserName.split(' ').map((n) => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{endorsement.endorserName}</h4>
                            <p className="text-sm text-gray-500">{endorsement.endorserTitle} at {endorsement.endorserCompany}</p>
                            <p className="text-xs text-gray-400 capitalize">{endorsement.relationship.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(endorsement.requestStatus, endorsement.isVerified)}
                          {endorsement.overallRating && (
                            <div className="mt-2">{renderStars(endorsement.overallRating)}</div>
                          )}
                        </div>
                      </div>

                      {endorsement.requestStatus === 'ACCEPTED' && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                          {endorsement.endorsementTitle && (
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2">"{endorsement.endorsementTitle}"</h5>
                          )}
                          {endorsement.endorsementText && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{endorsement.endorsementText}</p>
                          )}
                          {endorsement.strengths.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {endorsement.strengths.map((strength, idx) => (
                                <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                  {strength}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {endorsement.requestStatus === 'SENT' && (
                        <div className="mt-3 text-sm text-yellow-600">
                          Waiting for response (expires {formatDate(endorsement.requestExpiresAt)})
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* References Tab */}
          {activeTab === 'references' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Manager References</h3>
                <button
                  onClick={() => setShowReferenceModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Request Reference
                </button>
              </div>

              {references.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">No references yet</p>
                  <p className="text-sm text-gray-400">Request references from your managers and supervisors</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {references.map((reference) => (
                    <div key={reference.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                            <span className="text-lg font-semibold text-purple-600">
                              {reference.referenceName.split(' ').map((n) => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{reference.referenceName}</h4>
                            <p className="text-sm text-gray-500">{reference.referenceTitle} at {reference.referenceCompany}</p>
                            <p className="text-xs text-gray-400 capitalize">{reference.referenceRelationship.replace(/_/g, ' ')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(reference.requestStatus, reference.requestStatus === 'COMPLETED')}
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-gray-500">
                        Reference for: <span className="font-medium text-gray-700 dark:text-gray-300">{reference.candidateTitle}</span> at {reference.companyName}
                      </div>

                      {reference.requestStatus === 'COMPLETED' && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-3">
                          {/* Performance Ratings */}
                          <div className="grid grid-cols-3 gap-4">
                            {reference.overallPerformance && (
                              <div>
                                <span className="text-xs text-gray-500">Overall</span>
                                {renderStars(reference.overallPerformance)}
                              </div>
                            )}
                            {reference.technicalCompetence && (
                              <div>
                                <span className="text-xs text-gray-500">Technical</span>
                                {renderStars(reference.technicalCompetence)}
                              </div>
                            )}
                            {reference.communicationSkills && (
                              <div>
                                <span className="text-xs text-gray-500">Communication</span>
                                {renderStars(reference.communicationSkills)}
                              </div>
                            )}
                          </div>

                          {reference.overallRecommendation && (
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              reference.overallRecommendation === 'highly_recommend'
                                ? 'bg-green-100 text-green-800'
                                : reference.overallRecommendation === 'recommend'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {reference.overallRecommendation.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                            </div>
                          )}

                          {reference.keyStrengths && (
                            <div>
                              <h6 className="text-xs font-medium text-gray-500 mb-1">Key Strengths:</h6>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{reference.keyStrengths}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {(reference.requestStatus === 'SENT' || reference.requestStatus === 'IN_PROGRESS') && (
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-sm text-yellow-600">
                            Waiting for response (expires {formatDate(reference.requestExpiresAt)})
                          </span>
                          <button
                            onClick={() => managerReferenceAPI.sendReminder(reference.id)}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            Send Reminder
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Certifications Tab */}
          {activeTab === 'certifications' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Certification Verifications</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Verified certifications from your profile
              </p>

              {certVerifications.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">No certification verifications yet</p>
                  <p className="text-sm text-gray-400">Add certifications to your profile to verify them</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {certVerifications.map((cert) => (
                    <div key={cert.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          {cert.badgeImageUrl ? (
                            <img src={cert.badgeImageUrl} alt={cert.certificationName} className="w-16 h-16 object-contain" />
                          ) : (
                            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{cert.certificationName}</h4>
                            <p className="text-sm text-gray-500">{cert.issuingOrganization}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Issued: {formatDate(cert.issueDate)}
                              {cert.expirationDate && ` - Expires: ${formatDate(cert.expirationDate)}`}
                            </p>
                            {cert.credentialId && (
                              <p className="text-xs text-gray-400">Credential ID: {cert.credentialId}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(cert.verificationStatus, cert.isVerified)}
                          {cert.credentialStatus && (
                            <p className={`text-xs mt-1 ${
                              cert.credentialStatus === 'active' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {cert.credentialStatus.charAt(0).toUpperCase() + cert.credentialStatus.slice(1)}
                            </p>
                          )}
                        </div>
                      </div>

                      {cert.isVerified && cert.verifiedSkills.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <p className="text-xs text-gray-500 mb-2">Verified Skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {cert.verifiedSkills.map((skill, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Email Verification Modal */}
      {showEmailModal && (
        <EmailVerificationModal
          onClose={() => setShowEmailModal(false)}
          onSuccess={() => {
            setShowEmailModal(false);
            loadAllData();
          }}
        />
      )}

      {/* Verify Code Modal */}
      {showVerifyCodeModal && selectedVerification && (
        <VerifyCodeModal
          verification={selectedVerification}
          onClose={() => {
            setShowVerifyCodeModal(false);
            setSelectedVerification(null);
          }}
          onSuccess={() => {
            setShowVerifyCodeModal(false);
            setSelectedVerification(null);
            loadAllData();
          }}
        />
      )}

      {/* Endorsement Request Modal */}
      {showEndorsementModal && (
        <EndorsementRequestModal
          onClose={() => setShowEndorsementModal(false)}
          onSuccess={() => {
            setShowEndorsementModal(false);
            loadAllData();
          }}
        />
      )}

      {/* Reference Request Modal */}
      {showReferenceModal && (
        <ReferenceRequestModal
          onClose={() => setShowReferenceModal(false)}
          onSuccess={() => {
            setShowReferenceModal(false);
            loadAllData();
          }}
        />
      )}
    </div>
  );
};

// Email Verification Modal
const EmailVerificationModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [workEmail, setWorkEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await emailVerificationAPI.request({ workEmail, companyName });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to send verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Verify Work Email</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Work Email
            </label>
            <input
              type="email"
              value={workEmail}
              onChange={(e) => setWorkEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="you@company.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="Company Inc."
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Verification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Verify Code Modal
const VerifyCodeModal: React.FC<{
  verification: EmailDomainVerification;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ verification, onClose, onSuccess }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await emailVerificationAPI.verify(verification.id, code);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Enter Verification Code</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          We sent a 6-digit code to {verification.workEmail}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength={6}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Endorsement Request Modal
const EndorsementRequestModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    endorserEmail: '',
    endorserName: '',
    endorserTitle: '',
    endorserCompany: '',
    relationship: 'colleague' as EndorserRelationship,
    workedAtCompany: '',
    requestMessage: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await peerEndorsementAPI.request(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md my-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Request Endorsement</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Endorser's Email *
            </label>
            <input
              type="email"
              value={formData.endorserEmail}
              onChange={(e) => setFormData({ ...formData, endorserEmail: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Endorser's Name *
            </label>
            <input
              type="text"
              value={formData.endorserName}
              onChange={(e) => setFormData({ ...formData, endorserName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.endorserTitle}
                onChange={(e) => setFormData({ ...formData, endorserTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company
              </label>
              <input
                type="text"
                value={formData.endorserCompany}
                onChange={(e) => setFormData({ ...formData, endorserCompany: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Relationship *
            </label>
            <select
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value as EndorserRelationship })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="colleague">Colleague</option>
              <option value="manager">Manager</option>
              <option value="direct_report">Direct Report</option>
              <option value="client">Client</option>
              <option value="mentor">Mentor</option>
              <option value="mentee">Mentee</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Personal Message (optional)
            </label>
            <textarea
              value={formData.requestMessage}
              onChange={(e) => setFormData({ ...formData, requestMessage: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="Add a personal note to your request..."
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reference Request Modal
const ReferenceRequestModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    referenceEmail: '',
    referenceName: '',
    referenceTitle: '',
    referenceCompany: '',
    referenceRelationship: 'direct_manager' as ReferenceRelationship,
    companyName: '',
    candidateTitle: '',
    requestMessage: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await managerReferenceAPI.request(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md my-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Request Manager Reference</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reference's Email *
            </label>
            <input
              type="email"
              value={formData.referenceEmail}
              onChange={(e) => setFormData({ ...formData, referenceEmail: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reference's Name *
            </label>
            <input
              type="text"
              value={formData.referenceName}
              onChange={(e) => setFormData({ ...formData, referenceName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.referenceTitle}
                onChange={(e) => setFormData({ ...formData, referenceTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company
              </label>
              <input
                type="text"
                value={formData.referenceCompany}
                onChange={(e) => setFormData({ ...formData, referenceCompany: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Relationship *
            </label>
            <select
              value={formData.referenceRelationship}
              onChange={(e) => setFormData({ ...formData, referenceRelationship: e.target.value as ReferenceRelationship })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="direct_manager">Direct Manager</option>
              <option value="skip_level_manager">Skip-Level Manager</option>
              <option value="team_lead">Team Lead</option>
              <option value="hr">HR</option>
              <option value="cto">CTO</option>
              <option value="ceo">CEO</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company *
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Where you worked"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Your Title *
              </label>
              <input
                type="text"
                value={formData.candidateTitle}
                onChange={(e) => setFormData({ ...formData, candidateTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Your role"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Personal Message (optional)
            </label>
            <textarea
              value={formData.requestMessage}
              onChange={(e) => setFormData({ ...formData, requestMessage: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="Add a personal note to your request..."
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerificationHub;
