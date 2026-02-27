import { Response } from 'express';
import { AuthRequest } from '../types';
import { Notification } from '../models';

export const getMyNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user!.id },
      order: [['created_at', 'DESC']],
      limit: 50,
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notification = await Notification.findOne({ where: { id: req.params.id, user_id: req.user!.id } });
    if (!notification) { res.status(404).json({ message: 'Notificacion no encontrada' }); return; }
    await notification.update({ read: true });
    res.json({ message: 'Notificacion marcada como leida' });
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.update({ read: true }, { where: { user_id: req.user!.id, read: false } });
    res.json({ message: 'Todas las notificaciones marcadas como leidas' });
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err });
  }
};
