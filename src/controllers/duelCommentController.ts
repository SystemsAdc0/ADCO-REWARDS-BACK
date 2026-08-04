import { Response } from "express";
import { AuthRequest } from "../types";
import DuelComment from "../models/DuelComment";
import { User } from "../models";
import { createNotification } from "../services/notificationService";
import { Op } from "sequelize";

const VS_THRESHOLD = 500;
const EXCLUDED_IDS = [20, 43];

export const getComments = async (
  _req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const top2 = await User.findAll({
      where: {
        role: { [Op.in]: ["user", "moderator"] },
        status: "active",
        id: { [Op.notIn]: EXCLUDED_IDS },
      },
      attributes: ["id", "points"],
      order: [["points", "DESC"]],
      limit: 2,
    });

    const duelActive =
      top2.length === 2 && top2[0].points - top2[1].points <= VS_THRESHOLD;

    if (!duelActive) {
      await DuelComment.destroy({ where: {} });
      res.json([]);
      return;
    }

    const comments = await DuelComment.findAll({
      include: [{ model: User, as: "user", attributes: ["id", "name", "avatar"] }],
      order: [["created_at", "ASC"]],
    });
    res.json(comments);
  } catch {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const createComment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { body } = req.body;
    if (!body || String(body).trim() === "") {
      res.status(400).json({ message: "El comentario no puede estar vacío" });
      return;
    }
    const comment = await DuelComment.create({
      user_id: req.user!.id,
      body: String(body).trim(),
    });
    const full = await DuelComment.findByPk(comment.id, {
      include: [{ model: User, as: "user", attributes: ["id", "name", "avatar"] }],
    });

    // Notificar a los duelistas solo si hay duelo activo (diferencia ≤ VS_THRESHOLD)
    const top2 = await User.findAll({
      where: {
        role: { [Op.in]: ["user", "moderator"] },
        status: "active",
        id: { [Op.notIn]: EXCLUDED_IDS },
      },
      attributes: ["id", "points"],
      order: [["points", "DESC"]],
      limit: 2,
    });

    if (
      top2.length === 2 &&
      top2[0].points - top2[1].points <= VS_THRESHOLD
    ) {
      const commenterName = (full as any)?.user?.name ?? "Alguien";
      const msg = `💬 ${commenterName} comentó en el duelo por el 1er lugar`;
      for (const duelista of top2) {
        if (duelista.id !== req.user!.id) {
          await createNotification(duelista.id, msg, "info");
        }
      }
    }

    res.status(201).json(full);
  } catch {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const updateComment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const comment = await DuelComment.findByPk(String(req.params.id));
    if (!comment) {
      res.status(404).json({ message: "Comentario no encontrado" });
      return;
    }
    if (comment.user_id !== req.user!.id) {
      res.status(403).json({ message: "No tienes permiso para editar este comentario" });
      return;
    }
    const { body } = req.body;
    if (!body || String(body).trim() === "") {
      res.status(400).json({ message: "El comentario no puede estar vacío" });
      return;
    }
    await comment.update({ body: String(body).trim() });
    res.json(comment);
  } catch {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const deleteComment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const comment = await DuelComment.findByPk(String(req.params.id));
    if (!comment) {
      res.status(404).json({ message: "Comentario no encontrado" });
      return;
    }
    if (comment.user_id !== req.user!.id) {
      res.status(403).json({ message: "No tienes permiso para eliminar este comentario" });
      return;
    }
    await comment.destroy();
    res.json({ message: "Comentario eliminado" });
  } catch {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
