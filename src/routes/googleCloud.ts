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

const router = Router();
router.post("/activity-entrie-signed-upload", googleActivityEntries);
router.post(
  "/activity-single-upload",
  uploadMemory.single("image"),
  activityCloud,
);
router.post(
  "/agreement-single-upload",
  uploadMemory.single("image"),
  agreementUpload,
);
// router.post("/event-single-upload-banner", uploadMemory.single("image"), eventUploadBanner)
router.post("/event-upload/:folder", uploadMemory.single("image"), eventUpload);
router.post("/download", getActivityFile);
export default router;
