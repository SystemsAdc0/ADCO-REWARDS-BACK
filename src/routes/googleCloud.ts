import { Router } from "express";
import {
  activityCloud,
  agreementUpload,
  getActivityFile,
  googleActivityEntries,
  redemptionsUpload,
} from "../controllers/googleCloudController";

const router = Router(); 
router.post("/activity-entrie-signed-upload", googleActivityEntries);
router.post("/activity-single-upload", activityCloud);
router.post("/agreement-single-upload", agreementUpload);
router.post("/download", getActivityFile);
export default router;
  