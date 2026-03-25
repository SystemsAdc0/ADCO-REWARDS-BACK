import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import {
  createPointRequest,
  getMySentRequests,
  getIncomingRequests,
  getPendingIncomingCount,
  respondToRequest,
} from "../controllers/pointRequestController";

const router = Router();

router.post("/", authenticate, createPointRequest);
router.get("/sent", authenticate, getMySentRequests);
router.get("/incoming", authenticate, getIncomingRequests);
router.get("/incoming/count", authenticate, getPendingIncomingCount);
router.put("/:id/respond", authenticate, respondToRequest);

export default router;
