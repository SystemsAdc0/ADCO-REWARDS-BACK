import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { sendUpdate, getUpdates } from "../controllers/updateController";

const router = Router();

router.get("/", authenticate, authorize("developer"), getUpdates);
router.post("/", authenticate, authorize("developer"), sendUpdate);

export default router;
