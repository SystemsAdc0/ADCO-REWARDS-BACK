import { Router } from "express";
import {
  getCourseModules,
  getCourseModuleById,
  createCourseModule,
  updateCourseModule,
  deleteCourseModule,
} from "../../controllers/courses/courseModuleController";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = Router();

/**
 * @swagger
 * /api/courses/modules:
 *   get:
 *     summary: Listar módulos de cursos
 *     tags: [CourseModules]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: course_id
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Lista de módulos }
 */
router.get("/", authenticate, getCourseModules);
router.get("/:id", authenticate, getCourseModuleById);

/**
 * @swagger
 * /api/courses/modules:
 *   post:
 *     summary: Crear módulo (admin)
 *     tags: [CourseModules]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, introduction, course_id]
 *             properties:
 *               name: { type: string }
 *               introduction: { type: string }
 *               image: { type: string }
 *               course_id: { type: integer }
 *     responses:
 *       201: { description: Módulo creado }
 */
router.post("/", authenticate, authorize("admin"), createCourseModule);
router.put("/:id", authenticate, authorize("admin"), updateCourseModule);
router.delete("/:id", authenticate, authorize("admin"), deleteCourseModule);

export default router;
