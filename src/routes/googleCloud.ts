import { Router } from "express";
import {
  activityCloud,
  getActivityFile,
  googleActivityEntries,
} from "../controllers/googleCloudController";

const router = Router();
router.post("/activity-entrie-signed-upload", googleActivityEntries);
router.post("/activity-single-upload", activityCloud);
router.post("/download", getActivityFile);
export default router;
