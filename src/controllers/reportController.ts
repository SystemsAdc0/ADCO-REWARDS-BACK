import { Response } from 'express';
import { AuthRequest } from '../types';
import { User, Prize, Redemption, ActivityEntry } from '../models';
import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';

export const getSummary = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.count({ where: { role: 'user' } });
    const totalPrizes = await Prize.count({ where: { status: 'active' } });
    const totalRedemptions = await Redemption.count();
    const pendingEntries = await ActivityEntry.count({ where: { status: 'pending' } });
    const pendingRedemptions = await Redemption.count({ where: { status: 'pending' } });

    const pointsResult = await sequelize.query<{ total: string }>(
      'SELECT SUM(points) as total FROM users WHERE role = "user"',
      { type: QueryTypes.SELECT }
    );
    const totalPointsInCirculation = pointsResult[0]?.total || 0;

    res.json({ totalUsers, totalPrizes, totalRedemptions, pendingEntries, pendingRedemptions, totalPointsInCirculation });
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err });
  }
};

export const getTopUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.findAll({
      where: { role: 'user', status: 'active' },
      attributes: { exclude: ['password'] },
      order: [['points', 'DESC']],
      limit: 10,
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err });
  }
};

export const getTopPrizes = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const prizes = await sequelize.query<{ prize_id: number; name: string; total: number }>(
      `SELECT r.prize_id, p.name, COUNT(r.id) as total
       FROM redemptions r JOIN prizes p ON r.prize_id = p.id
       GROUP BY r.prize_id, p.name ORDER BY total DESC LIMIT 10`,
      { type: QueryTypes.SELECT }
    );
    res.json(prizes);
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err });
  }
};
