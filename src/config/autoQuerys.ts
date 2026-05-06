import { col, fn, literal } from "sequelize";
import { ActivityEntry, ChildrenDay, ChildrenDayVotes, User } from "../models";
import { ActivityEntryStatus } from "../types";
import { createNotification } from "../services/notificationService";

export const sendNotification = async () => {
  try {
    const users = await ChildrenDay.findAll({
      attributes: ["user_id"],
      raw: true,
    });

    console.log(users);

    for (let u of users) {
      await createNotification(
        u.user_id,
        `Actualización del ranking: ahora puedes comentar en las batallas para apoyar a tu compañero favorito.`,
        "info",
        "success",
      );
    }
  } catch (error) {
    console.error("Error registering points:", error);
  }
};

//   {
//     user_id: 10,
//     image: 'https://storage.googleapis.com/adco_rewards_public/children_day/1776279873240-b1030296-bd06-4dc8-984f-ec6953235c2f.webp',
//     quantity: 11
//   },
//   {
//     user_id: 53,
//     image: 'https://storage.googleapis.com/adco_rewards_public/children_day/1776211146488-6ec04b72-d268-4ae0-862f-0c359175d4ad.webp',
//     quantity: 7
//   },
