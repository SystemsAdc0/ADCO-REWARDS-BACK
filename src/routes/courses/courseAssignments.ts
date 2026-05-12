import { Router } from "express";
import {
  getAssignments,
  assignCourse,
  removeAssignment,
} from "../../controllers/courses/userCourseAssignmentController";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = Router();

router.get("/", authenticate, authorize("admin"), getAssignments);
router.post("/", authenticate, authorize("admin"), assignCourse);
router.delete("/:id", authenticate, authorize("admin"), removeAssignment);

export default router;
