import { col, fn, literal } from "sequelize";
import { ActivityEntry, ChildrenDay, ChildrenDayVotes, User } from "../models";
import { ActivityEntryStatus } from "../types";
import { createNotification } from "../services/notificationService";

export const registerPoints = async () => {
  try {
    const users = await ChildrenDay.findAll({
      attributes: [
        "user_id",
        "image",
        [fn("COUNT", col("votes.children_day_id")), "quantity"],
      ],
      include: [
        {
          model: ChildrenDayVotes,
          as: "votes",
          attributes: [],
          required: false,
        },
      ],
      group: ["ChildrenDay.user_id", "ChildrenDay.image"],
      order: [[literal("quantity"), "DESC"]],
      raw: true,
    });

    for (let u of users) {
      const exist = await ActivityEntry.findOne({
        where: { user_id: u.user_id, activity_id: 22 },
      });
      if (!exist) {
        const register = {
          user_id: u.user_id,
          activity_id: 22,
          status: "approved" as ActivityEntryStatus,
          file: u.image,
          reviewed_by: 1,
        };
        const employee = await User.findByPk(u.user_id);

        if (employee?.dataValues.id === users[0].user_id) {
          console.log("la persona que tuvo mas puntos ", users[0].user_id);
          await ActivityEntry.create(register);
          await employee.update({ points: employee.points + 150 });
          await createNotification(
            u.user_id,
            `Se a asignado 150 puntos fuiste la ganadora de la actvidad del dia del niño , felicidades!`,
            "success", 
            "approved",
          );
        } else {
          if (!employee?.dataValues) return;
          await ActivityEntry.create(register);
          await employee.update({ points: employee.points + 50 });
          await createNotification(
            u.user_id,
            `Se a asignado 50 puntos por participacion el la dinamica dia del niño`,
            "success",
            "approved",
          );
        }
      }
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
