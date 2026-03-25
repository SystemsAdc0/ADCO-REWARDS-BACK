import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models";
import { AuthRequest } from "../types";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, points, role, birth_date, company } = req.body;
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
      role: role,
      points: points,
      birth_date: birth_date || null,
      company: company || null,
    });
    res
      .status(201)
      .json({ message: "Usuario registrado correctamente", id: user.id });
  } catch (err) {
    res.status(500).json({ message: "Error al registrar", error: err });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
   
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
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
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as jwt.SignOptions,
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
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error al iniciar sesion", error: err });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: "Se requieren la contraseña actual y la nueva" });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: "La nueva contraseña debe tener al menos 6 caracteres" });
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
  } catch (err) {
    res.status(500).json({ message: "Error al cambiar la contraseña", error: err });
  }
};

export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.user!.id, {
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
