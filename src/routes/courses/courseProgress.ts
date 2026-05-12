import { Router } from "express";
import {
  getUserProgress,
  markSectionComplete,
} from "../../controllers/courses/userCourseProgressController";
import { authenticate } from "../../middlewares/authenticate";

const router = Router();

router.get("/", authenticate, getUserProgress);
router.post("/", authenticate, markSectionComplete);

export default router;
