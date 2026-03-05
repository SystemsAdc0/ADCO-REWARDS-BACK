import { Request, Response } from "express";
import { AuthRequest } from "../types";
import { Activity, ActivityEntry, User, PointHistory } from "../models";
import { createNotification } from "../services/notificationService";

export const getActivities = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const activities = await Activity.findAll({
      where: { status: "active" },
      order: [["start_date", "ASC"]],
    });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const createActivity = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const activity = await Activity.create(req.body);
    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const updateActivity = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const activity = await Activity.findByPk(String(req.params.id));
    if (!activity) {
      res.status(404).json({ message: "Actividad no encontrada" });
      return;
    }
    await activity.update(req.body);
    res.json(activity);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const deleteActivity = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const activity = await Activity.findByPk(String(req.params.id));
    if (!activity) {
      res.status(404).json({ message: "Actividad no encontrada" });
      return;
    }
    await activity.update({ status: "inactive" });
    res.json({ message: "Actividad desactivada" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const joinActivity = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
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
    if (!req.file) {
      res
        .status(400)
        .json({ message: "Archivo de participacion no encontrado" });
      return;
    }

    const entry = await ActivityEntry.create({
      user_id: userId,
      activity_id: activityId,
      file_name: req.file.originalname,
    });
    res.status(201).json({
      message: "Participacion registrada, pendiente de revision",
      entry,
    });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getEntries = async (
  _req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const entries = await ActivityEntry.findAll({
      include: [
        { association: "user", attributes: ["id", "name", "email"] },
        {
          association: "activity",
          attributes: ["id", "name", "points_reward"],
        },
      ],
      order: [["created_at", "DESC"]],
    });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const reviewEntry = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const entry = await ActivityEntry.findByPk(String(req.params.id), {
      include: [{ association: "activity" }],
    });
    if (!entry) {
      res.status(404).json({ message: "Participacion no encontrada" });
      return;
    }
    if (entry.status !== "pending") {
      res.status(400).json({ message: "Ya fue revisada" });
      return;
    }

    const { status, review_notes } = req.body;
    await entry.update({ status, reviewed_by: req.user!.id, review_notes });

    if (status === "approved") {
      const activity = (
        entry as unknown as {
          activity: { points_reward: number; name: string };
        }
      ).activity;
      const user = await User.findByPk(entry.user_id);
      if (user && activity) {
        await user.update({ points: user.points + activity.points_reward });
        await PointHistory.create({
          user_id: user.id,
          points: activity.points_reward,
          action: "earned",
          description: `Actividad aprobada: ${activity.name}`,
        });
        await createNotification(
          user.id,
          `Ganaste ${activity.points_reward} puntos por "${activity.name}"`,
          "success",
        );
      }
    } else {
      await createNotification(
        entry.user_id,
        `Tu participacion fue rechazada. ${review_notes || ""}`,
        "warning",
      );
    }

    res.json({ message: "Participacion revisada", entry });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};
