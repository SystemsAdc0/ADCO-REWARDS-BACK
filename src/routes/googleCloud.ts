import { Router } from "express";
import {
  activityCloud,
  agreementUpload,
  eventUpload,
  getActivityFile,
  googleActivityEntries,
  redemptionsUpload,
} from "../controllers/googleCloudController";
import { uploadMemory } from "../middlewares/upload";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();
router.post("/activity-entrie-signed-upload", authenticate, googleActivityEntries);
router.post(
  "/activity-single-upload",
  authenticate,
  authorize("admin"),
  uploadMemory.single("image"),
  activityCloud,
);
router.post(
  "/agreement-single-upload",
  authenticate,
  authorize("admin"),
  uploadMemory.single("image"),
  agreementUpload,
);
router.post(
  "/event-upload/:folder",
  authenticate,
  authorize("admin"),
  uploadMemory.single("image"),
  eventUpload,
);
router.post("/download", authenticate, getActivityFile);
export default router;
