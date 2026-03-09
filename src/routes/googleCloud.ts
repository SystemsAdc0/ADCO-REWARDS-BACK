import { Router } from "express";
import {
  getActivityFile,
  googleActivityPost,
  googleCloudCtr,
} from "../controllers/googleCloudController";

const router = Router();
router.post("/signed-upload", googleCloudCtr);
router.post("/activity-signed-upload", googleActivityPost);
router.post("/download", getActivityFile);
export default router;
