import { Router } from "express";
import {
  getEvidence,
  getEvidenceById,
  submitEvidence,
  reviewEvidence,
  deleteEvidence,
} from "../../controllers/courses/courseModuleSectionEvidenceController";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = Router();

/**
 * @swagger
 * /api/courses/evidence:
 *   get:
 *     summary: Listar evidencias
 *     tags: [CourseEvidence]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: course_module_section_activity_id
 *         schema: { type: integer }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [approved, rejected, pending] }
 *     responses:
 *       200: { description: Lista de evidencias }
 */
router.get("/", authenticate, getEvidence);
router.get("/:id", authenticate, getEvidenceById);

/**
 * @swagger
 * /api/courses/evidence:
 *   post:
 *     summary: Enviar evidencia (user)
 *     tags: [CourseEvidence]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [course_module_section_activity_id, evidence]
 *             properties:
 *               course_module_section_activity_id: { type: integer }
 *               evidence: { type: string }
 *     responses:
 *       201: { description: Evidencia enviada }
 */
router.post("/", authenticate, submitEvidence);
router.put("/:id/review", authenticate, authorize("admin", "moderator"), reviewEvidence);
router.delete("/:id", authenticate, authorize("admin"), deleteEvidence);

export default router;
