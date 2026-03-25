import { Router } from "express";
import {
  activityCloud,
  agreementUpload,
  getActivityFile,
  googleActivityEntries,
  redemptionsUpload,
} from "../controllers/googleCloudController";
import { uploadMemory } from "../middlewares/upload";

const router = Router();
router.post("/activity-entrie-signed-upload", googleActivityEntries);
router.post("/activity-single-upload", uploadMemory.single("image"), activityCloud);
router.post("/agreement-single-upload", uploadMemory.single("image"), agreementUpload);
router.post("/download", getActivityFile);
export default router;
  