import { Router } from "express";
import {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../../controllers/courses/courseModuleSectionQuestionController";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = Router();

/**
 * @swagger
 * /api/courses/questions:
 *   get:
 *     summary: Listar preguntas de examen
 *     tags: [CourseQuestions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: course_module_section_exam_id
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Lista de preguntas con respuestas }
 */
router.get("/", authenticate, getQuestions);
router.get("/:id", authenticate, getQuestionById);

/**
 * @swagger
 * /api/courses/questions:
 *   post:
 *     summary: Crear pregunta (admin)
 *     tags: [CourseQuestions]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question, type, course_module_section_exam_id]
 *             properties:
 *               question: { type: string }
 *               type: { type: string, enum: [multiple_choice, open] }
 *               course_module_section_exam_id: { type: integer }
 *     responses:
 *       201: { description: Pregunta creada }
 */
router.post("/", authenticate, authorize("admin"), createQuestion);
router.put("/:id", authenticate, authorize("admin"), updateQuestion);
router.delete("/:id", authenticate, authorize("admin"), deleteQuestion);

export default router;
