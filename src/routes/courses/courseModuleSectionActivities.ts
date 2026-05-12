import { Router } from "express";
import {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
} from "../../controllers/courses/courseModuleSectionActivityController";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = Router();

/**
 * @swagger
 * /api/courses/activities:
 *   get:
 *     summary: Listar actividades de sección
 *     tags: [CourseModuleSectionActivities]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: course_module_section_id
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Lista de actividades }
 */
router.get("/", authenticate, getActivities);
router.get("/:id", authenticate, getActivityById);

/**
 * @swagger
 * /api/courses/activities:
 *   post:
 *     summary: Crear actividad (admin)
 *     tags: [CourseModuleSectionActivities]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, type, course_module_section_id]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               type: { type: string, enum: [questions, evidence, exam] }
 *               course_module_section_id: { type: integer }
 *     responses:
 *       201: { description: Actividad creada }
 */
router.post("/", authenticate, authorize("admin"), createActivity);
router.put("/:id", authenticate, authorize("admin"), updateActivity);
router.delete("/:id", authenticate, authorize("admin"), deleteActivity);

export default router;
