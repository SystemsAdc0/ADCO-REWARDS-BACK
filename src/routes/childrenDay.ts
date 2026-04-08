import Router from "express";
import { authenticate } from "../middlewares/authenticate";
import { getParticipate } from "../controllers/ChildrenDayController";
import { authorize } from "../middlewares/authorize";
import { childrenDayUpload } from "../controllers/googleCloudController";
import { uploadMemory } from "../middlewares/upload";
const router = Router();

router.get(
  "/participate",
  authenticate,
  authorize("user", "moderator"),
  getParticipate,
);

router.post(
  "/",
  authenticate,
  authorize("user", "moderator"),
  uploadMemory.single("image"),
  childrenDayUpload,
);

export default router;
