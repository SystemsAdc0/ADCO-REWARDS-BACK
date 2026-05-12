import { Router } from "express";
import {
  getUserAnswers,
  getUserAnswerById,
  submitUserAnswer,
  reviewUserAnswer,
  deleteUserAnswer,
} from "../../controllers/courses/courseModuleSectionUserAnswerController";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = Router();

/**
 * @swagger
 * /api/courses/user-answers:
 *   get:
 *     summary: Listar respuestas de usuarios
 *     tags: [CourseUserAnswers]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: question_id
 *         schema: { type: integer }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, approved, rejected, auto_approved] }
 *     responses:
 *       200: { description: Lista de respuestas }
 */
router.get("/", authenticate, getUserAnswers);
router.get("/:id", authenticate, getUserAnswerById);

/**
 * @swagger
 * /api/courses/user-answers:
 *   post:
 *     summary: Enviar respuesta (user)
 *     tags: [CourseUserAnswers]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question_id]
 *             properties:
 *               question_id: { type: integer }
 *               answer_text: { type: string }
 *               answer_option_id: { type: integer }
 *     responses:
 *       201: { description: Respuesta enviada }
 */
router.post("/", authenticate, submitUserAnswer);
router.put("/:id/review", authenticate, authorize("admin", "moderator"), reviewUserAnswer);
router.delete("/:id", authenticate, authorize("admin"), deleteUserAnswer);

export default router;
