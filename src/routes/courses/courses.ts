import { Router } from "express";
import {
  getCourses,
  getMyCourses,
  getCourseById,
  getCourseFullContent,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../../controllers/courses/courseController";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = Router();

router.get("/mine", authenticate, getMyCourses);
router.get("/", getCourses);
router.get("/:id/play", getCourseFullContent);
router.get("/:id", getCourseById);

router.post("/", authenticate, authorize("admin"), createCourse);
router.put("/:id", authenticate, authorize("admin"), updateCourse);
router.delete("/:id", authenticate, authorize("admin"), deleteCourse);

export default router;
