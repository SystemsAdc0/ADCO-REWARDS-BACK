import { NextFunction } from "express";
import { AuthRequest } from "../types";
import { Activity, ActivityEntry } from "../models";
import { Response } from "express";
export const authActivity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;

    const activityId = parseInt(String(req.params.id));
    const activity = await Activity.findByPk(activityId);

    if (!activity || activity.status !== "active") {
      res.status(404).json({ message: "Actividad no disponible" });
      return;
    }

    const existing = await ActivityEntry.findOne({
      where: { user_id: userId, activity_id: activityId },
    });

    if (existing) {
      res.status(400).json({ message: "Ya participas en esta actividad" });
      return;
    }

    if (!req.body.file) {
      res
        .status(400)
        .json({ message: "Archivo de participacion no encontrado" });
      return;
    }
    next();
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};
