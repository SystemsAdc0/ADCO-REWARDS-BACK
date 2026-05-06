import { Router } from "express";
import {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  toggleActivityStatus,
  joinActivity,
  getEntries,
  reviewEntry,
  getActivitiesPublic,
  updateAnswer,
  reviewAnswer,
  revertEntry,
} from "../controllers/activityController";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { upload } from "../middlewares/upload";
import { authActivity } from "../middlewares/authActivity";

const router = Router();

router.get("/public", getActivitiesPublic);
router.get("/private/admin", authenticate, authorize("admin"), getActivities);
router.get(
  "/private",
  authenticate,
  authorize("admin", "user", "moderator"),
  getActivities,
);

router.post("/", authenticate, authorize("admin"), createActivity);
router.put("/:id", authenticate, authorize("admin"), updateActivity);
router.patch(
  "/:id/toggle",
  authenticate,
  authorize("admin"),
  toggleActivityStatus,
);
router.delete("/:id", authenticate, authorize("admin"), deleteActivity);
router.post(
  "/:id/join",
  authenticate,
  authorize("user", "moderator"),
  authActivity,
  joinActivity,
);
router.put(
  "/answers/:id",
  authenticate,
  authorize("user", "moderator"),
  updateAnswer,
);
router.put(
  "/answers/:id/review",
  authenticate,
  authorize("admin", "moderator"),
  reviewAnswer,
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
router.put("/entries/revert", authenticate, authorize("admin"), revertEntry)

export default router;
