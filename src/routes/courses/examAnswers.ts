import { Router } from "express";
import {
  getAnswers,
  getAnswerById,
  createAnswer,
  updateAnswer,
  deleteAnswer,
} from "../../controllers/courses/examAnswerController";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = Router();

/**
 * @swagger
 * /api/courses/answers:
 *   get:
 *     summary: Listar opciones de respuesta
 *     tags: [CourseAnswers]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: course_module_section_question_id
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Lista de opciones }
 */
router.get("/", authenticate, getAnswers);
router.get("/:id", authenticate, getAnswerById);

/**
 * @swagger
 * /api/courses/answers:
 *   post:
 *     summary: Crear opción de respuesta (admin)
 *     tags: [CourseAnswers]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [answer, course_module_section_question_id]
 *             properties:
 *               answer: { type: string }
 *               is_correct: { type: boolean }
 *               course_module_section_question_id: { type: integer }
 *     responses:
 *       201: { description: Opción creada }
 */
router.post("/", authenticate, authorize("admin"), createAnswer);
router.put("/:id", authenticate, authorize("admin"), updateAnswer);
router.delete("/:id", authenticate, authorize("admin"), deleteAnswer);

export default router;
