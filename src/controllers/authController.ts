import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { State, User, PointHistory } from "../models";
import { AuthRequest } from "../types";
import { validatePassword } from "../validators/password";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      points,
      role,
      birth_date,
      company,
      state_id,
    } = req.body;
    const pwError = validatePassword(password);
    if (pwError) {
      res.status(400).json({ message: pwError });
      return;
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      res.status(400).json({ message: "El email ya esta registrado" });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: ["user", "admin"].includes(role) ? role : "user",
      points: points,
      birth_date: birth_date || null,
      company: company || null,
      state_id: state_id || null,
    });
    if (points && Number(points) > 0) {
      await PointHistory.create({
        user_id: user.id,
        points: Number(points),
        action: "adjusted",
        description: "Puntos iniciales al registrar cuenta",
      });
    }

    res
      .status(201)
      .json({ message: "Usuario registrado correctamente", id: user.id });
  } catch {
    res.status(500).json({ message: "Error al registrar" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      where: { email },
      include: {
        model: State,
        as: "state",
        attributes: ["name", "status"],
      },
    });
    if (!user) {
      res.status(401).json({ message: "Credenciales invalidas" });
      return;
    }
    if (user.status === "inactive") {
      res.status(403).json({ message: "Cuenta inactiva" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ message: "Credenciales invalidas" });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        state_id: user.state_id,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" } as jwt.SignOptions,
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points,
        avatar: user.avatar,
        can_request_points: user.can_request_points ?? false,
        company: user.company ?? null,
        birth_date: user.birth_date ?? null,
        state: (user as User & { state?: State }).state ?? null,
      },
    });
  } catch {
    res.status(500).json({ message: "Error al iniciar sesion" });
  }
};

export const changePassword = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res
        .status(400)
        .json({ message: "Se requieren la contraseña actual y la nueva" });
      return;
    }

    const pwError = validatePassword(newPassword);
    if (pwError) {
      res.status(400).json({ message: pwError });
      return;
    }

    const user = await User.findByPk(req.user!.id);
    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      res.status(401).json({ message: "La contraseña actual es incorrecta" });
      return;
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashed });

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch {
    res
      .status(500)
      .json({ message: "Error al cambiar la contraseña" });
  }
};

export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.user!.id, {
      attributes: { exclude: ["password"] },
      include: {
        model: State,
        as: "state",
        attributes: ["name", "status"],
      },
    });

    
    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }
    res.json(user);
  } catch {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
