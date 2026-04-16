import { Notification, User } from "../models";
import { sendEmail } from "./sendEmail";

type NotifType = "info" | "success" | "warning";

export const createNotification = async (
  user_id: number,
  message: string,
  type: NotifType = "info",
) => {
  //enviamos un correo de la notificacion
  const user = await User.findByPk(String(user_id));

  if (!user) return;
  await sendEmail({ to: user.email, message: message });
  return Notification.create({ user_id, message, type });
};
