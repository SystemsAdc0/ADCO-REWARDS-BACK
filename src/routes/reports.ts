import { Router } from "express";
import {
  getSummary,
  getTopUsers,
  getTopPrizes,
  getPendingCounts,
  getTopParticipants,
  getParticipationsRanking,
  getUserMissingActivities,
} from "../controllers/reportController";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();

router.get("/summary", authenticate, authorize("admin"), getSummary);
router.get("/top-users", getTopUsers);
router.get("/top-prizes", authenticate, authorize("admin"), getTopPrizes);
router.get("/pending-counts", authenticate, getPendingCounts);
router.get(
  "/top-participants",
  authenticate,
  authorize("admin"),
  getTopParticipants,
);
router.get(
  "/participations-ranking",
  authenticate,
  authorize("admin"),
  getParticipationsRanking,
);
router.get(
  "/user-missing-activities/:userId",
  authenticate,
  authorize("admin"),
  getUserMissingActivities,
);

export default router;
