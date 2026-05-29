import { Router } from "express";

import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

import {
  cancelEvent,
  cancelRegistration,
  createEvent,
  createEventImages,
  deleteEvent,
  deleteEventImageById,
  deleteLocationImageById,
  getEventById,
  getEventRegistrations,
  getEvents,
  getEventsGalleries,
  registerToEvent,
  updateEvent,
} from "../controllers/eventController";

const router = Router();

router.get("/gallery", authenticate, authorize("user", "moderator"), getEventsGalleries)
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
router.put("/gallery/:id", authenticate, authorize("admin"), createEventImages)
router.put("/:id", authenticate, authorize("admin"), updateEvent);
router.delete("/:id", authenticate, authorize("admin"), deleteEvent);
router.delete("/cancel/:id", authenticate, authorize("admin"), cancelEvent);
router.delete("/:id/location/:imageId", authenticate, authorize("admin"), deleteLocationImageById);
router.delete("/:id/gallery/:imageId", authenticate, authorize("admin"), deleteEventImageById);

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
