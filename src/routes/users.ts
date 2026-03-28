import { Router } from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  addPoints,
  updateUserAavatar,
  togglePointRequestPermission,
  getUserFullHistory,
  getUserDirectory,
  resetUserPassword,
} from "../controllers/userController";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Listar todos los usuarios
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de usuarios }
 */

router.get("/", authenticate, authorize("admin"), getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Datos del usuario }
 */
router.get("/directory", authenticate, getUserDirectory);
router.get("/:id", authenticate, authorize("admin"), getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Usuario actualizado }
 */
router.put(
  "/avatar",
  authenticate,
  authorize("admin", "moderator", "user"),
  updateUserAavatar,
);
router.put("/:id", authenticate, authorize("admin"), updateUser);

/**
 * @swagger
 * /api/users/{id}/add-points:
 *   post:
 *     summary: Asignar puntos a un usuario
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [points]
 *             properties:
 *               points: { type: integer }
 *               description: { type: string }
 *     responses:
 *       200: { description: Puntos agregados }
 */
router.post("/:id/add-points", authenticate, authorize("admin"), addPoints);
router.patch("/:id/toggle-point-request", authenticate, authorize("admin"), togglePointRequestPermission);
router.get("/:id/full-history", authenticate, authorize("admin"), getUserFullHistory);
router.patch("/:id/reset-password", authenticate, authorize("admin"), resetUserPassword);
router.delete("/:id", authenticate, authorize("admin"), deleteUser);
export default router;
