import { Router } from 'express';
import { getMyHistory, getUserHistory } from '../controllers/pointController';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';

const router = Router();

router.get('/history', authenticate, authorize('user', 'admin', 'moderator'), getMyHistory);
router.get('/history/:userId', authenticate, authorize('admin'), getUserHistory);

export default router;
