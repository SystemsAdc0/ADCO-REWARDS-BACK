import { Router } from "express";
import {
  getSummary,
  getTopUsers,
  getTopPrizes,
  getPendingCounts,
} from "../controllers/reportController";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();

router.get("/summary", authenticate, authorize("admin"), getSummary);
router.get("/top-users", getTopUsers);
router.get("/top-prizes", authenticate, authorize("admin"), getTopPrizes);
router.get("/pending-counts", authenticate, getPendingCounts);

export default router;
 