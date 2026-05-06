import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "../controllers/duelCommentController";

const router = Router();

router.get("/", authenticate, getComments);
router.post("/", authenticate, createComment);
router.put("/:id", authenticate, updateComment);
router.delete("/:id", authenticate, deleteComment);

export default router;
