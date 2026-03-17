import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { getAgreement } from "../controllers/agreementController";
import { authorize } from "../middlewares/authorize";

const router = Router();
router.get("/", authenticate, authorize("admin", "user"), getAgreement);
export default Router();
