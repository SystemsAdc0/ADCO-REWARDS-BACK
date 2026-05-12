import { Router } from "express";
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../controllers/courses/departmentController";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = Router();

/**
 * @swagger
 * /api/courses/departments:
 *   get:
 *     summary: Listar departamentos
 *     tags: [Departments]
 *     security: []
 *     responses:
 *       200: { description: Lista de departamentos }
 */
router.get("/", getDepartments);
router.get("/:id", getDepartmentById);

/**
 * @swagger
 * /api/courses/departments:
 *   post:
 *     summary: Crear departamento (admin)
 *     tags: [Departments]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *     responses:
 *       201: { description: Departamento creado }
 */
router.post("/", authenticate, authorize("admin"), createDepartment);
router.put("/:id", authenticate, authorize("admin"), updateDepartment);
router.delete("/:id", authenticate, authorize("admin"), deleteDepartment);

export default router;
