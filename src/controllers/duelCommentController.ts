import { Response } from "express";
import { AuthRequest } from "../types";
import DuelComment from "../models/DuelComment";
import { User } from "../models";

export const getComments = async (
  _req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const comments = await DuelComment.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "avatar"],
        },
      ],
      order: [["created_at", "ASC"]],
    });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
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
    res.status(201).json(full);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
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
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
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
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};
