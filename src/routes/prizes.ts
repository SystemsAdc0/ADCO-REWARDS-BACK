import { Router } from 'express';
import { getPrizes, getPrizeById, createPrize, updatePrize, deletePrize } from '../controllers/prizeController';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { upload } from '../middlewares/upload';

const router = Router();

/**
 * @swagger
 * /api/prizes:
 *   get:
 *     summary: Listar premios
 *     tags: [Prizes]
 *     security: []
 *     responses:
 *       200: { description: Lista de premios }
 */
router.get('/', getPrizes);
router.get('/:id', getPrizeById);

/**
 * @swagger
 * /api/prizes:
 *   post:
 *     summary: Crear premio (admin)
 *     tags: [Prizes]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, description, points_required, stock]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               points_required: { type: integer }
 *               stock: { type: integer }
 *               image: { type: string, format: binary }
 *     responses:
 *       201: { description: Premio creado }
 */
router.post('/', authenticate, authorize('admin'), upload.single('image'), createPrize);
router.put('/:id', authenticate, authorize('admin'), upload.single('image'), updatePrize);
router.delete('/:id', authenticate, authorize('admin'), deletePrize);

export default router;
