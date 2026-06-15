import { Response } from "express";
import { AuthRequest } from "../types";
import {
  User,
  PointHistory,
  ActivityEntry,
  Redemption,
  Activity,
  Prize,
  State,
} from "../models";
import { createNotification } from "../services/notificationService";
import bcrypt from "bcryptjs";
import sequelize from "../config/database";
import { QueryTypes } from "sequelize";

export const getUsers = async (
  _req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: State,
          as: "state",
        },
      ],
      attributes: { exclude: ["password"] },
      order: [["id", "DESC"]],
    });
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
      include: [
        {
          model: State,
          as: "state",
        },
      ],
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

    const { name, email, role, status, state_id, company, birth_date } =
      req.body;

    await user.update({
      name,
      email,
      role,
      status,
      state_id,
      company,
      birth_date,
    });
    res.json({
      message: "Usuario actualizado",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        birth_date: user.birth_date,
        company: user.company,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const resetUserPassword = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      res
        .status(400)
        .json({ message: "La contraseña debe tener al menos 6 caracteres" });
      return;
    }
    const user = await User.findByPk(String(id));
    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashed });
    res.json({ message: "Contraseña restablecida correctamente" });
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
      assigned_by: req.user!.id,
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

export const togglePointRequestPermission = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = await User.findByPk(String(req.params.id));
    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }
    await user.update({ can_request_points: !user.can_request_points });
    res.json({ can_request_points: user.can_request_points });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getUserFullHistory = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = String(req.params.id);

    const [pointHistory, activityEntries, redemptions] = await Promise.all([
      PointHistory.findAll({
        where: { user_id: userId },
        order: [["created_at", "DESC"]],
        include: [{ model: User, as: "assigner", attributes: ["id", "name"] }],
      }),
      ActivityEntry.findAll({
        where: { user_id: userId },
        order: [["created_at", "DESC"]],
        include: [
          {
            model: Activity,
            as: "activity",
            attributes: ["id", "name", "points_reward"],
          },
          { model: User, as: "reviewer", attributes: ["id", "name"] },
        ],
      }),
      Redemption.findAll({
        where: { user_id: userId },
        order: [["created_at", "DESC"]],
        include: [
          {
            model: Prize,
            as: "prize",
            attributes: ["id", "name", "points_required"],
          },
        ],
      }),
    ]);

    res.json({ pointHistory, activityEntries, redemptions });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getUserDirectory = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const users = await User.findAll({
      where: { status: "active" },
      attributes: ["id", "name", "email", "avatar", "points"],
      order: [["name", "ASC"]],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getBirthdaysThisMonth = async (
  _req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const users = await sequelize.query<{
      id: number;
      name: string;
      avatar: string;
      birth_date: string;
      company: string | null;
      state: string | null;
    }>(
      `SELECT u.id, u.name, u.avatar, u.birth_date, u.company, s.name AS state
       FROM users u
       LEFT JOIN states s ON s.id = u.state_id
       WHERE u.status = 'active'
         AND u.birth_date IS NOT NULL
         AND MONTH(u.birth_date) = :month
       ORDER BY DAY(u.birth_date) ASC`,
      { type: QueryTypes.SELECT, replacements: { month: currentMonth } },
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const updateUserAavatar = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = await User.findByPk(String(req.user?.id));
    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
    }
    const { avatar } = req.body;
    await user?.update({ avatar });
    res.json({
      message: "Usuario actualizado",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error", error: error });
  }
};
