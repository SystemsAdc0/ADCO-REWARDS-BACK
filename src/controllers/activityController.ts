import { Request, Response } from "express";
import { AuthRequest } from "../types";
import {
  Activity,
  ActivityEntry,
  User,
  PointHistory,
  Redemption,
} from "../models";
import { createNotification } from "../services/notificationService";
import { Sequelize, Op, where } from "sequelize";
import SocialMedia from "../models/SocialMedia";
import { deleteActivityEntryFile } from "./googleCloudController";

export const getActivities = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    if (!user?.id) {
      res.status(403).json("usuario no identificado");
      return;
    }

    // Auto-desactivar actividades cuya fecha de fin ya pasó
    await Activity.update(
      { status: "inactive" },
      {
        where: {
          status: "active",
          end_date: { [Op.lt]: new Date() },
        },
      },
    );

    const activities = await Activity.findAll({
      attributes: {
        include: [
          [
            Sequelize.literal(
              `EXISTS (SELECT 1 FROM activity_entries ae WHERE ae.activity_id = Activity.id AND ae.user_id = ${user.id} AND ae.status != 'rejected')`,
            ),
            "participate",
          ],
          [
            Sequelize.literal(
              `(SELECT ae.review_notes FROM activity_entries ae WHERE ae.activity_id = Activity.id AND ae.user_id = ${user.id} AND ae.status = 'rejected' ORDER BY ae.updated_at DESC LIMIT 1)`,
            ),
            "note",
          ],
        ],
      },
      include: {
        model: SocialMedia,
        as: "social_medias",
        attributes: ["name"],
      },
      // where: user.role == "admin" ? {} : { status: "active" },
      order: [["id", "DESC"]],
    });

    res.json(activities);
  } catch (err) {
    console.log(err);

    res.status(500).json({ message: "Error", error: err });
  }
};

export const getActivitiesPublic = async (
  req: Request,
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
  console.log(req.body);

  try {
    const activity = await Activity.create(req.body);
    const { social_medias } = req.body;

    for (let s of social_medias) {
      await SocialMedia.create({
        activity_id: activity.dataValues.id,
        name: s.name,
      });
    }
    res.status(201).json(activity);
  } catch (err) {
    console.log(err);

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

export const toggleActivityStatus = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const activity = await Activity.findByPk(String(req.params.id));
    if (!activity) {
      res.status(404).json({ message: "Actividad no encontrada" });
      return;
    }
    const newStatus = activity.status === "active" ? "inactive" : "active";
    await activity.update({ status: newStatus });
    res.json({
      message: `Actividad ${newStatus === "active" ? "activada" : "desactivada"}`,
      status: newStatus,
    });
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
    const activityExist = await ActivityEntry.findOne({
      where: {
        user_id: userId,
        activity_id: activityId,
      },
    });

    if (activityExist?.dataValues) {
      await ActivityEntry.update(
        {
          status: "pending",
          file: req.body.file,
        },
        {
          where: {
            activity_id: activityId,
            user_id: userId,
            status: "rejected",
          },
        },
      );
      res.status(201).json({
        message: "Participacion registrada, pendiente de revision",
        activityExist,
      });
      return;
    }
    const entry = await ActivityEntry.create({
      user_id: userId,
      activity_id: activityId,
      file: req.body.file,
    });
    res.status(201).json({
      message: "Participacion registrada, pendiente de revision",
      entry,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getEntries = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const isAdmin = req.user?.role === "admin";
    const entries = await ActivityEntry.findAll({
      attributes: [
        "id",
        "user_id",
        "activity_id",
        "status",
        "reviewed_by",
        "review_notes",
        "file",
        "created_at",
        "updated_at",
      ],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
        {
          model: Activity,
          as: "activity",
          attributes: ["id", "name", "points_reward"],
        },
        ...(isAdmin
          ? [
              {
                model: User,
                as: "reviewer",
                attributes: ["id", "name", "avatar"],
                required: false,
              },
            ]
          : []),
      ],
      order: [["created_at", "DESC"]],
    });

    res.json(entries.map((e) => e.get({ plain: true })));
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

    // La razon de rechazo es obligatoria
    if (status === "rejected") {
      if (!review_notes || String(review_notes).trim() === "") {
        res.status(400).json({ message: "La razon de rechazo es obligatoria" });
        return;
      }
      // Eliminar el archivo de Google Cloud Storage para que el usuario pueda re-subir
      if (entry.file) {
        await deleteActivityEntryFile(entry.file);
      }
    }

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
          assigned_by: req.user!.id,
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
        `Tu participacion en "${(entry as any).activity?.name}" fue rechazada. Motivo: ${review_notes}`,
        "warning",
      );
    }

    res.json({ message: "Participacion revisada", entry });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};
