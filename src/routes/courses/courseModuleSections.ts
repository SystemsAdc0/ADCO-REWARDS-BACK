import { Router } from "express";
import {
  getSections,
  getSectionById,
  createSection,
  updateSection,
  deleteSection,
} from "../../controllers/courses/courseModuleSectionController";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = Router();

/**
 * @swagger
 * /api/courses/sections:
 *   get:
 *     summary: Listar secciones de módulo
 *     tags: [CourseModuleSections]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: course_module_id
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Lista de secciones }
 */
router.get("/", authenticate, getSections);
router.get("/:id", authenticate, getSectionById);

/**
 * @swagger
 * /api/courses/sections:
 *   post:
 *     summary: Crear sección (admin)
 *     tags: [CourseModuleSections]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type, course_module_id]
 *             properties:
 *               name: { type: string }
 *               type: { type: string, enum: [activity, information, story] }
 *               course_module_id: { type: integer }
 *     responses:
 *       201: { description: Sección creada }
 */
router.post("/", authenticate, authorize("admin"), createSection);
router.put("/:id", authenticate, authorize("admin"), updateSection);
router.delete("/:id", authenticate, authorize("admin"), deleteSection);

export default router;
