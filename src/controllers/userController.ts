import { Response } from "express";
import { AuthRequest } from "../types";
import { User, PointHistory } from "../models";
import { createNotification } from "../services/notificationService";

export const getUsers = async (
  _req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const users = await User.findAll({ attributes: { exclude: ["password"] } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getUserById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = await User.findByPk(String(req.params.id), {
      attributes: { exclude: ["password"] },
    });
    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const updateUser = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = await User.findByPk(String(req.params.id));
    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }
    const { name, email, role, status } = req.body;
    await user.update({ name, email, role, status });
    res.json({
      message: "Usuario actualizado",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const deleteUser = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = await User.findByPk(String(req.params.id));
    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }
    await user.update({ status: "inactive" });
    res.json({ message: "Usuario desactivado" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const addPoints = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = await User.findByPk(String(req.params.id));
    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }
    const { points, description } = req.body;
    await user.update({ points: user.points + points });
    await PointHistory.create({
      user_id: user.id,
      points,
      action: "adjusted",
      description: description || "Ajuste manual de puntos",
    });
    await createNotification(
      user.id,
      `Se te han asignado ${points} puntos. ${description || ""}`,
      "success",
    );
    res.json({
      message: "Puntos agregados",
      total_points: user.points + points,
    });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};
