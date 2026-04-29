import { Notification, User } from "../models";
import { formatTemplate } from "./emailTemplates";
import type { Status } from "./emailTemplates";

import { sendEmail } from "./sendEmail";

export type NotifType = "info" | "success" | "warning";

export const createNotification = async (
  user_id: number,
  message: string,
  type: NotifType = "info",
  status?: Status,
) => {
  //enviamos un correo de la notificacion
  const user = await User.findByPk(String(user_id));
  if (!user) return;
  try {
    await sendEmail({
      to: user.email,
      message: formatTemplate({ type, message, name: user.name, status }),
    });
  } catch (error) {
    console.log(error);
  }
  return Notification.create({ user_id, message, type });
};
