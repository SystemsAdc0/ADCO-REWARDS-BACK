import { Response } from "express";
import { AuthRequest } from "../types";
import PlatformUpdate from "../models/PlatformUpdate";
import { User, Notification } from "../models";
import { Op } from "sequelize";
import { createNotification } from "../services/notificationService";

export const sendUpdate = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { title, message, type = "info" } = req.body;

    if (!title || String(title).trim() === "") {
      res.status(400).json({ message: "El título es obligatorio" });
      return;
    }
    if (!message || String(message).trim() === "") {
      res.status(400).json({ message: "El mensaje es obligatorio" });
      return;
    }

    const update = await PlatformUpdate.create({
      title: String(title).trim(),
      message: String(message).trim(),
      type,
      sent_by: req.user!.id,
    });

    // Notificar a todos los usuarios activos en bloque
    const users = await User.findAll({
      where: {
        status: "active",
        id: { [Op.ne]: req.user!.id },
      },
      attributes: ["id"],
      raw: true,
    });

    const fullMessage = `📢 ${String(title).trim()}: ${String(message).trim()}`;
    users.forEach((u, i) => {
      setTimeout(() => createNotification(u.id, fullMessage, "success"), i * 3000);
    });

    res.status(201).json({ update, notified: users.length });
  } catch (err) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getUpdates = async (
  _req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const updates = await PlatformUpdate.findAll({
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "name"],
        },
      ],
      order: [["created_at", "DESC"]],
    });
    res.json(updates);
  } catch (err) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
