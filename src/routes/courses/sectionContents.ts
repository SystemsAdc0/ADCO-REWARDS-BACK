import { Router } from "express";
import {
  getSectionContents,
  getSectionContentById,
  createSectionContent,
  updateSectionContent,
  deleteSectionContent,
  reorderSectionContet,
} from "../../controllers/courses/sectionContentController";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = Router();

/**
 * @swagger
 * /api/courses/links:
 *   get:
 *     summary: Listar enlaces de sección
 *     tags: [CourseModuleSectionLinks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: course_module_section_id
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Lista de enlaces }
 */
router.get("/", authenticate, getSectionContents);
router.get("/:id", authenticate, getSectionContentById);

/**
 * @swagger
 * /api/courses/links:
 *   post:
 *     summary: Crear enlace (admin)
 *     tags: [CourseModuleSectionLinks]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [link, type, course_module_section_id]
 *             properties:
 *               link: { type: string }
 *               type: { type: string, enum: [video, image, text, link, audio] }
 *               course_module_section_id: { type: integer }
 *     responses:
 *       201: { description: Enlace creado }
 */
router.post("/", authenticate, authorize("admin"), createSectionContent);
router.put("/:id", authenticate, authorize("admin"), updateSectionContent);
router.patch("/reorder", authenticate, authorize("admin"), reorderSectionContet);
router.delete("/:id", authenticate, authorize("admin"), deleteSectionContent);

export default router;
