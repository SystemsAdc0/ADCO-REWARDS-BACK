import { Router } from "express";

import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

import {
  cancelEvent,
  cancelRegistration,
  createEvent,
  deleteEvent,
  getEventById,
  getEventRegistrations,
  getEvents,
  registerToEvent,
  updateEvent,
} from "../controllers/eventController";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("admin", "moderator", "user"),
  getEvents,
);
router.get(
  "/:id",
  authenticate,
  authorize("admin", "moderator", "user"),
  getEventById,
);
router.post("/", authenticate, authorize("admin"), createEvent);
router.put("/:id", authenticate, authorize("admin"), updateEvent);
router.delete("/:id", authenticate, authorize("admin"), deleteEvent);
router.delete("/cancel/:id", authenticate, authorize("admin"), cancelEvent);

// EVENT REGISTRATIONS
router.get(
  "/registrations/:id",
  authenticate,
  authorize("admin"),
  getEventRegistrations,
);

router.post(
  "/:id/register",
  authenticate,
  authorize("admin", "moderator", "user"),
  registerToEvent,
);

router.delete(
  "/registrations/:id",
  authenticate,
  authorize("user", "moderator"),
  cancelRegistration
);

export default router;
