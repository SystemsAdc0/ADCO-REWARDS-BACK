import { DataTypes, Model, Optional } from "sequelize";
import { ActivityAnswerStatus } from "../types";
import sequelize from "../config/database";

interface ActivityAnswerAttributes {
  id: number;
  activity_question_id: number;
  user_id: number;
  answer: string;
  status: ActivityAnswerStatus;
  created_at?: Date;
  updated_at?: Date;
}

interface ActivityAnswerCreationAttributes extends Optional<
  ActivityAnswerAttributes,
  "id"
> {}

class ActivityAnswer
  extends Model<ActivityAnswerAttributes, ActivityAnswerCreationAttributes>
  implements ActivityAnswerAttributes
{
  public id!: number;
  public activity_question_id!: number;
  public user_id!: number;
  public answer!: string;
  public status!: ActivityAnswerStatus;
  public readonly created_at?: Date;
  public readonly updated_at?: Date;
}

ActivityAnswer.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    activity_question_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    answer: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    sequelize,
    tableName: "activity_answers",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default ActivityAnswer;
