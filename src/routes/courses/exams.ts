import { Router } from "express";
import {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  getExamResult,
} from "../../controllers/courses/examController";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import {
  createFullQuestion,
  updateFullQuestion,
} from "../../controllers/courses/examQuestionController";

const router = Router();

/**
 * @swagger
 * /api/courses/exams:
 *   get:
 *     summary: Listar exámenes
 *     tags: [CourseExams]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: course_module_section_activity_id
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Lista de exámenes }
 */
router.get("/", authenticate, getExams);
router.get("/:id", authenticate, getExamById);
router.get("/:id/result", authenticate, getExamResult)

/**
 * @swagger
 * /api/courses/exams:
 *   post:
 *     summary: Crear examen (admin)
 *     tags: [CourseExams]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type, passing_score, course_module_section_activity_id]
 *             properties:
 *               name: { type: string }
 *               type: { type: string, enum: [diagnostic, partial, activity, final] }
 *               passing_score: { type: integer }
 *               course_module_section_activity_id: { type: integer }
 *     responses:
 *       201: { description: Examen creado }
 */
router.post("/", authenticate, authorize("admin"), createExam);
router.post("/full", authenticate, authorize("admin"), createFullQuestion);
router.put("/:id/full", authenticate, authorize("admin"), updateFullQuestion);
router.put("/:id", authenticate, authorize("admin"), updateExam);
router.delete("/:id", authenticate, authorize("admin"), deleteExam);

export default router;
