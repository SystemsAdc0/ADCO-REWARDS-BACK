import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import {
  createState,
  deleteState,
  getStates,
  updateState,
} from "../controllers/stateController";

const router = Router();

router.get("/", authenticate, authorize("admin"), getStates);
router.post("/", authenticate, authorize("admin"), createState);
router.put("/:id", authenticate, authorize("admin"), updateState);
router.delete("/:id", authenticate, authorize("admin"), deleteState);

export default router;
