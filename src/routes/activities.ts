import { Router } from "express";
import {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  joinActivity,
  getEntries,
  reviewEntry,
  getActivitiesPublic,
} from "../controllers/activityController";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { upload } from "../middlewares/upload";
import { authActivity } from "../middlewares/authActivity";

const router = Router();

router.get("/public", getActivitiesPublic);
router.get(
  "/private",
  authenticate,
  authorize("admin", "user", "moderator"),
  getActivities,
);

router.post("/", authenticate, authorize("admin"), createActivity);
router.put("/:id", authenticate, authorize("admin"), updateActivity);
router.delete("/:id", authenticate, authorize("admin"), deleteActivity);
router.post(
  "/:id/join",
  authenticate,
  authorize("user", "moderator"),
  authActivity,
  joinActivity,
);
router.get(
  "/entries",
  authenticate,
  authorize("admin", "moderator"),
  getEntries,
);
router.put(
  "/entries/:id/review",
  authenticate,
  authorize("admin", "moderator"),
  reviewEntry,
);

export default router;
