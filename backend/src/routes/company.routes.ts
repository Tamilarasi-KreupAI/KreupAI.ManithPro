import { Router } from 'express';
import { getCompanies, getCompanyByName } from '../controllers/company.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getCompanies);
router.get('/:name', authenticate, getCompanyByName);

export default router;
