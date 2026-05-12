import { Router } from "express";
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../../controllers/courses/courseController";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = Router();

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Listar cursos
 *     tags: [Courses]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: department_id
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Lista de cursos }
 */
router.get("/", getCourses);
router.get("/:id", getCourseById);

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Crear curso (admin)
 *     tags: [Courses]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, department_id]
 *             properties:
 *               name: { type: string }
 *               department_id: { type: integer }
 *     responses:
 *       201: { description: Curso creado }
 */
router.post("/", authenticate, authorize("admin"), createCourse);
router.put("/:id", authenticate, authorize("admin"), updateCourse);
router.delete("/:id", authenticate, authorize("admin"), deleteCourse);

export default router;
