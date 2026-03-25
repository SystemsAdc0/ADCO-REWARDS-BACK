import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import {
  createAgreement,
  deleteAgreement,
  getAgreement,
  getAgreementByID,
  updateAgreement,
  deleteAgreementImageById,
} from "../controllers/agreementController";
import { authorize } from "../middlewares/authorize";

const router = Router();
router.get("/", authenticate, authorize("admin", "user", "moderator"), getAgreement);
router.get("/:id", authenticate, authorize("admin", "user", "moderator"), getAgreementByID);
router.put("/:id", authenticate, authorize("admin"), updateAgreement);
router.post("/", authenticate, authorize("admin"), createAgreement);
router.delete("/:id/images/:imageId", authenticate, authorize("admin"), deleteAgreementImageById);
router.delete("/:id", authenticate, authorize("admin"), deleteAgreement);

export default router;
