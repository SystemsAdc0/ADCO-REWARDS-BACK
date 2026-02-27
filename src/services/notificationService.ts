import { Notification } from '../models';

type NotifType = 'info' | 'success' | 'warning';

export const createNotification = async (
  user_id: number,
  message: string,
  type: NotifType = 'info'
) => {
  return Notification.create({ user_id, message, type });
};
