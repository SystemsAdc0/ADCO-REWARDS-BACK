import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { AuthRequest } from '../types';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) { res.status(400).json({ message: 'El email ya esta registrado' }); return; }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: 'user' });
    res.status(201).json({ message: 'Usuario registrado correctamente', id: user.id });
  } catch (err) {
    res.status(500).json({ message: 'Error al registrar', error: err });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) { res.status(401).json({ message: 'Credenciales invalidas' }); return; }
    if (user.status === 'inactive') { res.status(403).json({ message: 'Cuenta inactiva' }); return; }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) { res.status(401).json({ message: 'Credenciales invalidas' }); return; }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, points: user.points, avatar: user.avatar },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al iniciar sesion', error: err });
  }
};

export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.user!.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) { res.status(404).json({ message: 'Usuario no encontrado' }); return; }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err });
  }
};
