import { Response } from 'express';
import { AuthRequest } from '../types';
import { PointHistory } from '../models';

export const getMyHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const history = await PointHistory.findAll({
      where: { user_id: req.user!.id },
      order: [['created_at', 'DESC']],
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err });
  }
};

export const getUserHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const history = await PointHistory.findAll({
      where: { user_id: req.params.userId },
      order: [['created_at', 'DESC']],
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err });
  }
};
