// Batch 29: Compliance Features API Service (8.3.1-8.3.11)
import type {
  GDPRConsentRecord,
  CCPARequest,
  EEOCReport,
  DataRetentionPolicy,
  DeletionRequest,
  ConsentPolicy,
  UserConsent,
  DataSubjectRequest,
  ComplianceAuditLog,
  ComplianceMetric,
  ComplianceDashboard,
  BiasAuditReport,
  SOC2Control,
  SOC2Audit,
  SOC2ReadinessScore,
  ComplianceStats,
} from '../types';

const API_BASE = '/api/compliance';

// ==========================================
// 8.3.1 GDPR Compliance API
// ==========================================

export const gdprAPI = {
  getConsents: async (params?: { userId?: string; consentType?: string }): Promise<GDPRConsentRecord[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'consent-1',
            userId: 'user-123',
            consentType: 'data_processing',
            purpose: 'Process job applications and candidate data',
            legalBasis: 'consent',
            granted: true,
            grantedAt: '2024-11-01T00:00:00Z',
            source: 'form',
            version: 2,
            policyVersion: '2.0',
            createdAt: '2024-11-01T00:00:00Z',
            updatedAt: '2024-11-01T00:00:00Z',
          },
        ]);
      }, 300);
    });
  },

  recordConsent: async (data: Partial<GDPRConsentRecord>): Promise<GDPRConsentRecord> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `consent-${Date.now()}`,
          userId: data.userId || '',
          consentType: data.consentType || 'data_processing',
          purpose: data.purpose || '',
          legalBasis: data.legalBasis || 'consent',
          granted: data.granted || false,
          grantedAt: data.granted ? new Date().toISOString() : undefined,
          source: 'api',
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as GDPRConsentRecord);
      }, 500);
    });
  },

  revokeConsent: async (consentId: string): Promise<GDPRConsentRecord> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: consentId,
          granted: false,
          revokedAt: new Date().toISOString(),
        } as GDPRConsentRecord);
      }, 500);
    });
  },

  exportUserData: async (userId: string): Promise<{ exportId: string; status: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          exportId: `export-${Date.now()}`,
          status: 'processing',
        });
      }, 500);
    });
  },
};

// ==========================================
// 8.3.2 CCPA Compliance API
// ==========================================

export const ccpaAPI = {
  getRequests: async (params?: { status?: string; requestType?: string }): Promise<CCPARequest[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'ccpa-1',
            requestType: 'delete',
            requestSource: 'web_form',
            requesterEmail: 'user@example.com',
            requesterName: 'John Doe',
            verificationMethod: 'email',
            status: 'pending',
            verified: false,
            dueDate: new Date(Date.now() + 45 * 24 * 3600000).toISOString(),
            createdAt: '2024-12-01T00:00:00Z',
            updatedAt: '2024-12-01T00:00:00Z',
          },
        ]);
      }, 300);
    });
  },

  createRequest: async (data: Partial<CCPARequest>): Promise<CCPARequest> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `ccpa-${Date.now()}`,
          ...data,
          status: 'pending',
          verified: false,
          dueDate: new Date(Date.now() + 45 * 24 * 3600000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as CCPARequest);
      }, 500);
    });
  },

  verifyRequest: async (requestId: string): Promise<CCPARequest> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: requestId,
          verified: true,
          verifiedAt: new Date().toISOString(),
          status: 'verified',
        } as CCPARequest);
      }, 500);
    });
  },

  completeRequest: async (requestId: string, response: string): Promise<CCPARequest> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: requestId,
          status: 'completed',
          completedAt: new Date().toISOString(),
          response,
        } as CCPARequest);
      }, 500);
    });
  },
};

// ==========================================
// 8.3.3 EEOC/OFCCP Reporting API
// ==========================================

export const eeocAPI = {
  getReports: async (): Promise<EEOCReport[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'eeoc-1',
            organizationId: 'org-1',
            reportType: 'eeo1',
            reportingYear: 2024,
            reportingPeriod: 'annual',
            status: 'draft',
            generatedBy: 'admin@company.com',
            createdAt: '2024-12-01T00:00:00Z',
            updatedAt: '2024-12-01T00:00:00Z',
          },
        ]);
      }, 300);
    });
  },

  generateReport: async (data: Partial<EEOCReport>): Promise<EEOCReport> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `eeoc-${Date.now()}`,
          organizationId: 'org-1',
          ...data,
          status: 'draft',
          generatedBy: 'current-user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as EEOCReport);
      }, 1000);
    });
  },

  submitReport: async (reportId: string): Promise<EEOCReport> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: reportId,
          status: 'submitted',
          submittedAt: new Date().toISOString(),
          filingConfirmation: `EEOC-${Date.now()}`,
        } as EEOCReport);
      }, 1000);
    });
  },
};

// ==========================================
// 8.3.4 Data Retention Policies API
// ==========================================

export const retentionAPI = {
  getPolicies: async (): Promise<DataRetentionPolicy[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'policy-1',
            name: 'Candidate Data Retention',
            description: 'Retain candidate data for 2 years after last activity',
            dataCategory: 'candidates',
            retentionPeriodDays: 730,
            retentionBasis: 'legal_requirement',
            actionOnExpiry: 'anonymize',
            autoEnforce: true,
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          {
            id: 'policy-2',
            name: 'Application Data Retention',
            description: 'Retain application data for 1 year',
            dataCategory: 'applications',
            retentionPeriodDays: 365,
            retentionBasis: 'business_need',
            actionOnExpiry: 'delete',
            autoEnforce: true,
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ]);
      }, 300);
    });
  },

  createPolicy: async (data: Partial<DataRetentionPolicy>): Promise<DataRetentionPolicy> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `policy-${Date.now()}`,
          ...data,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as DataRetentionPolicy);
      }, 500);
    });
  },

  enforcePolicy: async (policyId: string): Promise<{ recordsProcessed: number; recordsDeleted: number }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          recordsProcessed: 1250,
          recordsDeleted: 45,
        });
      }, 2000);
    });
  },
};

// ==========================================
// 8.3.5 Right to be Forgotten API
// ==========================================

export const deletionAPI = {
  getRequests: async (): Promise<DeletionRequest[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'del-1',
            requestType: 'full_deletion',
            requesterEmail: 'user@example.com',
            regulation: 'gdpr',
            dataScope: ['profile', 'applications', 'messages'],
            exclusions: [],
            status: 'pending',
            verified: false,
            createdAt: '2024-12-01T00:00:00Z',
            updatedAt: '2024-12-01T00:00:00Z',
          },
        ]);
      }, 300);
    });
  },

  createRequest: async (data: Partial<DeletionRequest>): Promise<DeletionRequest> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `del-${Date.now()}`,
          ...data,
          status: 'pending',
          verified: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as DeletionRequest);
      }, 500);
    });
  },

  executeRequest: async (requestId: string): Promise<DeletionRequest> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: requestId,
          status: 'completed',
          completedAt: new Date().toISOString(),
          deletedItems: { profile: 1, applications: 5, messages: 23 },
        } as DeletionRequest);
      }, 2000);
    });
  },
};

// ==========================================
// 8.3.6 Consent Management API
// ==========================================

export const consentAPI = {
  getPolicies: async (): Promise<ConsentPolicy[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'cp-1',
            name: 'Essential Cookies',
            description: 'Required for website functionality',
            category: 'essential',
            purpose: 'Enable core website features',
            legalBasis: 'legitimate_interests',
            dataCategories: ['technical'],
            recipients: [],
            crossBorderTransfer: false,
            transferCountries: [],
            isRequired: true,
            canWithdraw: false,
            displayOrder: 1,
            isActive: true,
            version: 1,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          {
            id: 'cp-2',
            name: 'Analytics Cookies',
            description: 'Help us understand how visitors interact',
            category: 'analytics',
            purpose: 'Website analytics',
            legalBasis: 'consent',
            dataCategories: ['usage'],
            recipients: ['Google Analytics'],
            crossBorderTransfer: true,
            transferCountries: ['US'],
            isRequired: false,
            canWithdraw: true,
            displayOrder: 2,
            isActive: true,
            version: 2,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          {
            id: 'cp-3',
            name: 'Marketing Communications',
            description: 'Receive job alerts and career tips',
            category: 'marketing',
            purpose: 'Promotional emails',
            legalBasis: 'consent',
            dataCategories: ['contact'],
            recipients: [],
            crossBorderTransfer: false,
            transferCountries: [],
            isRequired: false,
            canWithdraw: true,
            displayOrder: 3,
            isActive: true,
            version: 1,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ]);
      }, 300);
    });
  },

  getUserConsents: async (userId: string): Promise<UserConsent[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'uc-1',
            userId,
            policyId: 'cp-1',
            policyName: 'Essential Cookies',
            consented: true,
            consentedAt: '2024-11-01T00:00:00Z',
            source: 'banner',
            policyVersion: 1,
            createdAt: '2024-11-01T00:00:00Z',
            updatedAt: '2024-11-01T00:00:00Z',
          },
          {
            id: 'uc-2',
            userId,
            policyId: 'cp-2',
            policyName: 'Analytics Cookies',
            consented: true,
            consentedAt: '2024-11-01T00:00:00Z',
            source: 'banner',
            policyVersion: 2,
            createdAt: '2024-11-01T00:00:00Z',
            updatedAt: '2024-11-01T00:00:00Z',
          },
        ]);
      }, 300);
    });
  },

  updateConsent: async (userId: string, policyId: string, consented: boolean): Promise<UserConsent> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `uc-${Date.now()}`,
          userId,
          policyId,
          consented,
          consentedAt: consented ? new Date().toISOString() : undefined,
          withdrawnAt: !consented ? new Date().toISOString() : undefined,
          source: 'api',
          policyVersion: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as UserConsent);
      }, 500);
    });
  },
};

// ==========================================
// 8.3.7 DSAR API
// ==========================================

export const dsarAPI = {
  getRequests: async (): Promise<DataSubjectRequest[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'dsar-1',
            requestType: 'access',
            regulation: 'gdpr',
            requesterEmail: 'user@example.com',
            requesterName: 'John Doe',
            verificationMethod: 'email',
            verified: true,
            verifiedAt: '2024-12-01T00:00:00Z',
            status: 'processing',
            priority: 'normal',
            receivedAt: '2024-12-01T00:00:00Z',
            deadlineAt: '2024-12-31T00:00:00Z',
            assignedTo: 'privacy@company.com',
            createdAt: '2024-12-01T00:00:00Z',
            updatedAt: '2024-12-01T00:00:00Z',
          },
        ]);
      }, 300);
    });
  },

  createRequest: async (data: Partial<DataSubjectRequest>): Promise<DataSubjectRequest> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const deadlineDays = data.regulation === 'ccpa' ? 45 : 30;
        resolve({
          id: `dsar-${Date.now()}`,
          ...data,
          status: 'received',
          priority: 'normal',
          verified: false,
          receivedAt: new Date().toISOString(),
          deadlineAt: new Date(Date.now() + deadlineDays * 24 * 3600000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as DataSubjectRequest);
      }, 500);
    });
  },

  respondToRequest: async (requestId: string, response: { responseType: string; responseDetails: string }): Promise<DataSubjectRequest> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: requestId,
          status: 'completed',
          responseType: response.responseType,
          responseDetails: response.responseDetails,
          respondedAt: new Date().toISOString(),
        } as DataSubjectRequest);
      }, 500);
    });
  },
};

// ==========================================
// 8.3.8 Audit Trail API
// ==========================================

export const auditAPI = {
  getLogs: async (params?: { eventType?: string; limit?: number }): Promise<ComplianceAuditLog[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'log-1',
            eventType: 'consent_change',
            eventCategory: 'gdpr',
            action: 'update',
            resourceType: 'consent',
            resourceId: 'consent-123',
            actorType: 'user',
            actorId: 'user-456',
            actorEmail: 'user@example.com',
            previousValue: { consented: true },
            newValue: { consented: false },
            changedFields: ['consented'],
            ipAddress: '192.168.1.1',
            success: true,
            tags: [],
            createdAt: '2024-12-05T10:30:00Z',
          },
        ]);
      }, 300);
    });
  },

  exportLogs: async (params: { format: string; startDate?: string; endDate?: string }): Promise<{ exportId: string; status: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          exportId: `export-${Date.now()}`,
          status: 'processing',
        });
      }, 500);
    });
  },
};

// ==========================================
// 8.3.9 Compliance Dashboard API
// ==========================================

export const dashboardAPI = {
  getMetrics: async (): Promise<ComplianceMetric[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'metric-1',
            organizationId: 'org-1',
            metricType: 'consent_rate',
            category: 'gdpr',
            period: 'monthly',
            periodStart: '2024-12-01T00:00:00Z',
            periodEnd: '2024-12-31T23:59:59Z',
            value: 92.5,
            previousValue: 90.2,
            target: 95,
            unit: 'percentage',
            status: 'on_track',
            calculatedAt: new Date().toISOString(),
          },
        ]);
      }, 300);
    });
  },

  getDashboard: async (): Promise<ComplianceDashboard> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          summary: {
            overallScore: 94.2,
            gdprCompliance: 96.5,
            ccpaCompliance: 92.8,
            eeocCompliance: 93.5,
          },
          pendingActions: {
            dsars: 3,
            deletionRequests: 2,
            consentUpdates: 5,
            retentionEnforcements: 1,
          },
          recentActivity: [
            { type: 'dsar_completed', description: 'DSAR #123 completed', timestamp: '2024-12-05T14:00:00Z' },
            { type: 'consent_updated', description: 'Bulk consent update', timestamp: '2024-12-05T12:00:00Z' },
          ],
          upcomingDeadlines: [
            { type: 'dsar', id: 'dsar-456', deadline: '2024-12-15T00:00:00Z', daysRemaining: 10 },
          ],
          riskAreas: [
            { area: 'Data Retention', risk: 'low', description: 'All policies enforced' },
          ],
        });
      }, 500);
    });
  },
};

// ==========================================
// 8.3.10 Bias Auditing API
// ==========================================

export const biasAuditAPI = {
  getReports: async (): Promise<BiasAuditReport[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'bias-1',
            organizationId: 'org-1',
            auditType: 'hiring_funnel',
            auditPeriod: 'quarterly',
            startDate: '2024-10-01T00:00:00Z',
            endDate: '2024-12-31T23:59:59Z',
            jobIds: [],
            departmentIds: [],
            stages: ['application', 'screening', 'interview', 'offer'],
            status: 'completed',
            overallScore: 87.5,
            riskLevel: 'low',
            demographicCategories: ['gender', 'ethnicity', 'age'],
            generatedBy: 'admin@company.com',
            createdAt: '2024-12-01T00:00:00Z',
            updatedAt: '2024-12-01T00:00:00Z',
          },
        ]);
      }, 300);
    });
  },

  generateReport: async (data: Partial<BiasAuditReport>): Promise<BiasAuditReport> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `bias-${Date.now()}`,
          organizationId: 'org-1',
          ...data,
          status: 'running',
          generatedBy: 'current-user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as BiasAuditReport);
      }, 500);
    });
  },

  getReport: async (reportId: string): Promise<BiasAuditReport> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: reportId,
          organizationId: 'org-1',
          auditType: 'hiring_funnel',
          auditPeriod: 'quarterly',
          startDate: '2024-10-01T00:00:00Z',
          endDate: '2024-12-31T23:59:59Z',
          jobIds: [],
          departmentIds: [],
          stages: ['application', 'screening', 'interview', 'offer'],
          status: 'completed',
          overallScore: 87.5,
          riskLevel: 'low',
          demographicCategories: ['gender', 'ethnicity', 'age'],
          findings: {
            summary: 'No significant bias detected',
            byStage: [
              { stage: 'application', score: 92, risk: 'low' },
              { stage: 'screening', score: 85, risk: 'low' },
              { stage: 'interview', score: 88, risk: 'low' },
              { stage: 'offer', score: 84, risk: 'medium' },
            ],
          },
          recommendations: [
            'Consider blind resume review',
            'Ensure diverse interview panels',
          ],
          generatedBy: 'admin@company.com',
          createdAt: '2024-12-01T00:00:00Z',
          updatedAt: '2024-12-01T00:00:00Z',
        });
      }, 300);
    });
  },
};

// ==========================================
// 8.3.11 SOC 2 Readiness API
// ==========================================

export const soc2API = {
  getControls: async (): Promise<SOC2Control[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'ctrl-1',
            controlId: 'CC1.1',
            category: 'security',
            name: 'Control Environment',
            description: 'Demonstrates commitment to integrity',
            trustServiceCriteria: 'CC',
            implementationStatus: 'implemented',
            implementedAt: '2024-06-01T00:00:00Z',
            evidenceRequired: ['Policy document', 'Training records'],
            evidenceProvided: [{ type: 'document', name: 'Security Policy', uploadedAt: '2024-06-01T00:00:00Z' }],
            lastTestedAt: '2024-11-01T00:00:00Z',
            testResult: 'pass',
            gaps: [],
            riskLevel: 'low',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-11-01T00:00:00Z',
          },
          {
            id: 'ctrl-2',
            controlId: 'CC2.1',
            category: 'security',
            name: 'Information and Communication',
            description: 'Obtains relevant information',
            trustServiceCriteria: 'CC',
            implementationStatus: 'in_progress',
            evidenceRequired: ['Communication procedures'],
            evidenceProvided: [],
            gaps: [{ description: 'Documentation incomplete', severity: 'medium' }],
            riskLevel: 'medium',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-11-01T00:00:00Z',
          },
        ]);
      }, 300);
    });
  },

  updateControl: async (controlId: string, data: Partial<SOC2Control>): Promise<SOC2Control> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: controlId,
          ...data,
          updatedAt: new Date().toISOString(),
        } as SOC2Control);
      }, 500);
    });
  },

  getAudits: async (): Promise<SOC2Audit[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'audit-1',
            organizationId: 'org-1',
            auditType: 'type2',
            auditPeriod: '12 months',
            startDate: '2024-01-01T00:00:00Z',
            endDate: '2024-12-31T23:59:59Z',
            auditorFirm: 'BigFour LLP',
            auditorContact: 'John Smith',
            auditorEmail: 'john.smith@bigfour.com',
            status: 'fieldwork',
            phase: 'Control testing',
            trustCategories: ['security', 'availability', 'confidentiality'],
            excludedControls: [],
            exceptions: [],
            recommendations: [],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-11-01T00:00:00Z',
          },
        ]);
      }, 300);
    });
  },

  getReadinessScore: async (): Promise<SOC2ReadinessScore> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          overallScore: 78,
          byCategory: {
            security: 85,
            availability: 72,
            processing_integrity: 80,
            confidentiality: 75,
            privacy: 78,
          },
          controlsStatus: {
            total: 45,
            implemented: 35,
            inProgress: 7,
            notStarted: 3,
          },
          gapsSummary: {
            critical: 0,
            high: 2,
            medium: 5,
            low: 8,
          },
          recommendations: [
            'Complete logging controls',
            'Document incident response',
            'Conduct penetration testing',
          ],
          lastUpdated: new Date().toISOString(),
        });
      }, 500);
    });
  },
};

// ==========================================
// Stats API
// ==========================================

export const statsAPI = {
  getStats: async (): Promise<ComplianceStats> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          gdpr: {
            activeConsents: 15234,
            pendingDSARs: 3,
            avgResponseTime: 18.5,
            consentRate: 92.5,
          },
          ccpa: {
            pendingRequests: 2,
            completedThisMonth: 8,
            avgResponseTime: 12.3,
          },
          eeoc: {
            reportsGenerated: 4,
            pendingSubmissions: 1,
            lastSubmission: '2024-11-15T00:00:00Z',
          },
          retention: {
            activePolicies: 5,
            recordsProcessedThisMonth: 12500,
            complianceRate: 98.7,
          },
          biasAudit: {
            auditsThisYear: 4,
            avgScore: 87.5,
            lastAudit: '2024-12-01T00:00:00Z',
          },
          soc2: {
            readinessScore: 78,
            controlsImplemented: 35,
            gapsRemaining: 10,
            auditStatus: 'fieldwork',
          },
        });
      }, 300);
    });
  },
};

export default {
  gdpr: gdprAPI,
  ccpa: ccpaAPI,
  eeoc: eeocAPI,
  retention: retentionAPI,
  deletion: deletionAPI,
  consent: consentAPI,
  dsar: dsarAPI,
  audit: auditAPI,
  dashboard: dashboardAPI,
  biasAudit: biasAuditAPI,
  soc2: soc2API,
  stats: statsAPI,
};
