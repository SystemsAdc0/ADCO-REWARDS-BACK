import { Request, Response } from 'express';
import { Prize } from '../models';
import { AuthRequest } from '../types';

export const getPrizes = async (req: Request, res: Response): Promise<void> => {
  try {
    const where: Record<string, unknown> = {};
    if (req.query.status) where.status = req.query.status;
    const prizes = await Prize.findAll({ where });
    res.json(prizes);
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err });
  }
};

export const getPrizeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const prize = await Prize.findByPk(String(req.params.id));
    if (!prize) { res.status(404).json({ message: 'Premio no encontrado' }); return; }
    res.json(prize);
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err });
  }
};

export const createPrize = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, points_required, stock } = req.body;
    const image = (req.file as Express.Multer.File | undefined)?.filename;
    const prize = await Prize.create({ name, description, points_required, stock, image });
    res.status(201).json(prize);
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err });
  }
};

export const updatePrize = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const prize = await Prize.findByPk(String(req.params.id));
    if (!prize) { res.status(404).json({ message: 'Premio no encontrado' }); return; }
    const { name, description, points_required, stock, status } = req.body;
    const image = (req.file as Express.Multer.File | undefined)?.filename || prize.image;
    await prize.update({ name, description, points_required, stock, status, image });
    res.json(prize);
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err });
  }
};

export const deletePrize = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const prize = await Prize.findByPk(String(req.params.id));
    if (!prize) { res.status(404).json({ message: 'Premio no encontrado' }); return; }
    await prize.update({ status: 'inactive' });
    res.json({ message: 'Premio desactivado' });
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err });
  }
};
