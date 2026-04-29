import { Request, Response } from "express";
import { Notification, Prize, User } from "../models";
import { AuthRequest } from "../types";
import { createNotification } from "../services/notificationService";

export const getPrizes = async (req: Request, res: Response): Promise<void> => {
  try {
    const where: Record<string, unknown> = {};
    if (req.query.status) where.status = req.query.status;
    const prizes = await Prize.findAll({ where, order: [["id", "DESC"]] });

    res.json(prizes);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getPrizeById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const prize = await Prize.findByPk(String(req.params.id));
    if (!prize) {
      res.status(404).json({ message: "Premio no encontrado" });
      return;
    }
    res.json(prize);
  } catch (err) {
    console.log(err);

    res.status(500).json({ message: "Error", error: err });
  }
};

export const createPrize = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, description, ...rest } = req.body;

    const formattedData = {
      ...rest,
      name: name?.trim().toLowerCase(),
      description: description?.trim(),
    };
    const prize = await Prize.create(formattedData);

    const users = await User.findAll({
      where: { status: "active" },
      attributes: ["id"],
      raw: true,
    });

    const message = `Se acaba de agregar un nuevo premio: ${name?.trim().toUpperCase()}, participa para ganar!`;

    const notifications = users.map((u) => ({
      user_id: u.id,
      message,
      type: "info" as const,
    }));

    await Notification.bulkCreate(notifications);

    res.status(201).json(prize);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const updatePrize = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const prize = await Prize.findByPk(String(req.params.id));
    if (!prize) {
      res.status(404).json({ message: "Premio no encontrado" });
      return;
    }
    if (!req.body) {
      res.status(404).json({ message: "datos no encontrados" });
      return;
    }
    const image =
      (req.file as Express.Multer.File | undefined)?.filename || prize.image;
    await prize.update({ ...req.body, image: image });
    res.json(prize);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const deletePrize = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const prize = await Prize.findByPk(String(req.params.id));
    if (!prize) {
      res.status(404).json({ message: "Premio no encontrado" });
      return;
    }
    await prize.update({ status: "inactive" });
    res.json({ message: "Premio desactivado" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};
