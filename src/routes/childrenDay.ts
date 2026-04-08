import Router from "express";
import { authenticate } from "../middlewares/authenticate";
import {
  changeVote,
  getParticipate,
  getParticipatingUsers,
  vote,
} from "../controllers/ChildrenDayController";
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
router.get(
  "/",
  authenticate,
  authorize("user", "moderator"),
  getParticipatingUsers,
);
router.post("/:id", authenticate, authorize("user", "moderator"), vote);
router.post(
  "/",
  authenticate,
  authorize("user", "moderator"),
  uploadMemory.single("image"),
  childrenDayUpload,
);

router.put("/:id", authenticate, authorize("user", "moderator"), changeVote);

export default router;
