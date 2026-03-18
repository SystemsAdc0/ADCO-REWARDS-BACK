import { Router } from "express";
import {
  createRedemption,
  getMyRedemptions,
  getAllRedemptions,
  updateRedemptionStatus,
  getWinners,
} from "../controllers/redemptionController";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { redemptionsUpload } from "../controllers/googleCloudController";

const router = Router();

router.post("/", authenticate, authorize("user"), createRedemption);
router.get(
  "/winners",
  authenticate,
  authorize("user", "admin", "moderator"),
  getWinners,
);
router.get("/my", authenticate, authorize("user"), getMyRedemptions);
router.get(
  "/",
  authenticate,
  authorize("admin", "moderator"),
  getAllRedemptions,
);
router.put(
  "/:id/status",
  authenticate,
  authorize("admin", "moderator"),
  // redemptionsUpload,
  updateRedemptionStatus,
);

export default router;
