// Batch 43-45: Enterprise Administration Routes (13.1-13.3)
import { Router } from 'express';
import * as adminController from '../controllers/batch43_45EnterpriseAdmin.controller';

const router = Router();

// ==========================================
// Batch 43: Multi-Tenant & Organization Routes (13.1)
// ==========================================

// Tenant management
router.get('/tenants', adminController.getTenants);
router.get('/tenants/:tenantId', adminController.getTenant);
router.post('/tenants', adminController.createTenant);
router.put('/tenants/:tenantId', adminController.updateTenant);

// Organization management
router.get('/organizations', adminController.getOrganizations);
router.get('/organizations/:orgId', adminController.getOrganization);
router.post('/organizations', adminController.createOrganization);
router.put('/organizations/:orgId', adminController.updateOrganization);

// Cost centers
router.get('/cost-centers', adminController.getCostCenters);

// Departments
router.get('/departments', adminController.getDepartments);

// ==========================================
// Batch 44: User & License Management Routes (13.2)
// ==========================================

// License management
router.get('/licenses', adminController.getLicenses);
router.post('/licenses/:licenseId/allocate', adminController.allocateLicense);
router.delete('/licenses/allocations/:allocationId', adminController.revokeLicense);

// Role templates
router.get('/role-templates', adminController.getRoleTemplates);

// Custom roles
router.get('/custom-roles', adminController.getCustomRoles);
router.post('/custom-roles', adminController.createCustomRole);

// Access reviews
router.get('/access-reviews', adminController.getAccessReviews);
router.post('/access-reviews', adminController.createAccessReview);

// Activity logs
router.get('/activity-logs', adminController.getUserActivityLogs);

// ==========================================
// Batch 45: Billing & Subscriptions Routes (13.3)
// ==========================================

// Subscription management
router.get('/subscription', adminController.getSubscription);
router.put('/subscription', adminController.updateSubscription);
router.post('/subscription/cancel', adminController.cancelSubscription);

// Invoices
router.get('/invoices', adminController.getInvoices);

// Usage & quotas
router.get('/usage', adminController.getUsageRecords);
router.get('/quotas', adminController.getQuotas);

// Enterprise contracts
router.get('/contracts', adminController.getEnterpriseContracts);

// Admin dashboard
router.get('/dashboard', adminController.getAdminDashboard);

export default router;
