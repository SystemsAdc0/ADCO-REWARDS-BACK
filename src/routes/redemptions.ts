import { Router } from 'express';
import { createRedemption, getMyRedemptions, getAllRedemptions, updateRedemptionStatus } from '../controllers/redemptionController';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';

const router = Router();

router.post('/', authenticate, authorize('user'), createRedemption);
router.get('/my', authenticate, authorize('user'), getMyRedemptions);
router.get('/', authenticate, authorize('admin', 'moderator'), getAllRedemptions);
router.put('/:id/status', authenticate, authorize('admin', 'moderator'), updateRedemptionStatus);

export default router;
