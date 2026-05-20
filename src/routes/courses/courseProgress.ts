import { Router } from "express";
import {
  getCourseUserProgress,
  getPendingEntries,
  getPendingReviewDetail,
  getUserProgress,
  markSectionComplete,
} from "../../controllers/courses/userCourseProgressController";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = Router();

router.get("/", authenticate, getUserProgress);
router.get("/users", authenticate, authorize("admin"), getCourseUserProgress)
router.get("/entries", authenticate, authorize("admin"), getPendingEntries)
router.get("/reviews", authenticate, authorize("admin"), getPendingReviewDetail)
router.post("/", authenticate, markSectionComplete);

export default router;
