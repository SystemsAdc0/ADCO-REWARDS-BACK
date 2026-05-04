import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface ActivityQuestionAttributes {
  id: number;
  activity_id: number;
  question: string;
  created_at?: Date;
  updated_at?: Date;
}

interface ActivityQuestionCreationAttributes extends Optional<
  ActivityQuestionAttributes,
  "id"
> {}

class ActivityQuestion
  extends Model<ActivityQuestionAttributes, ActivityQuestionCreationAttributes>
  implements ActivityQuestionAttributes
{
  public id!: number;
  public activity_id!: number;
  public question!: string;
  public readonly created_at?: Date;
  public readonly updated_at?: Date;
}

ActivityQuestion.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    activity_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    question: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: true,
    tableName: "activity_questions",
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default ActivityQuestion;
