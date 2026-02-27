import { Router } from 'express';
import { getSummary, getTopUsers, getTopPrizes } from '../controllers/reportController';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';

const router = Router();

router.get('/summary', authenticate, authorize('admin'), getSummary);
router.get('/top-users', authenticate, authorize('admin'), getTopUsers);
router.get('/top-prizes', authenticate, authorize('admin'), getTopPrizes);

export default router;
