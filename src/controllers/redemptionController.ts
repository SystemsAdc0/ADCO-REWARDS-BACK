import { Response } from 'express';
import { AuthRequest, RedemptionStatus } from '../types';
import { Redemption, Prize, User, PointHistory } from '../models';
import { createNotification } from '../services/notificationService';

export const createRedemption = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { prize_id } = req.body;

    const prize = await Prize.findByPk(prize_id);
    if (!prize || prize.status !== 'active') { res.status(404).json({ message: 'Premio no disponible' }); return; }
    if (prize.stock <= 0) { res.status(400).json({ message: 'Sin stock disponible' }); return; }

    const user = await User.findByPk(userId);
    if (!user || user.points < prize.points_required) {
      res.status(400).json({ message: 'Puntos insuficientes' }); return;
    }

    await user.update({ points: user.points - prize.points_required });
    await prize.update({ stock: prize.stock - 1 });
    const redemption = await Redemption.create({ user_id: userId, prize_id, points_spent: prize.points_required });
    await PointHistory.create({ user_id: userId, points: -prize.points_required, action: 'spent', description: `Canje: ${prize.name}` });
    await createNotification(userId, `Canjeaste "${prize.name}" por ${prize.points_required} puntos. En proceso de entrega.`, 'success');

    res.status(201).json(redemption);
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err });
  }
};

export const getMyRedemptions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const redemptions = await Redemption.findAll({
      where: { user_id: req.user!.id },
      include: [{ association: 'prize' }],
      order: [['created_at', 'DESC']],
    });
    res.json(redemptions);
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err });
  }
};

export const getAllRedemptions = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const redemptions = await Redemption.findAll({
      include: [{ association: 'user', attributes: ['id', 'name', 'email'] }, { association: 'prize' }],
      order: [['created_at', 'DESC']],
    });
    res.json(redemptions);
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err });
  }
};

export const updateRedemptionStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const redemption = await Redemption.findByPk(String(req.params.id), { include: [{ association: 'prize' }] });
    if (!redemption) { res.status(404).json({ message: 'Canje no encontrado' }); return; }

    const status = req.body.status as RedemptionStatus;
    const updates: Partial<{ status: RedemptionStatus; redeemed_at: Date; notes: string }> = { status };
    if (status === 'delivered') updates.redeemed_at = new Date();
    if (req.body.notes) updates.notes = req.body.notes;

    await redemption.update(updates);
    const prize = (redemption as unknown as { prize: { name: string } }).prize;
    await createNotification(redemption.user_id, `Tu canje de "${prize?.name}" fue actualizado a: ${status}`, 'info');
    res.json({ message: 'Estado actualizado', redemption });
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err });
  }
};
