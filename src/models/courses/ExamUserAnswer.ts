import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";

export type ExamUserAnswerStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "auto_approved";

interface ExamUserAnswerAttributes {
  id: number;
  user_id: number;
  question_id: number;
  answer_text?: string;
  answer_option_id?: number;
  status: ExamUserAnswerStatus;
  is_correct?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface ExamUserAnswerCreationAttributes extends Optional<
  ExamUserAnswerAttributes,
  "id" | "answer_text" | "answer_option_id" | "status" | "is_correct"
> {}

class ExamUserAnswer
  extends Model<ExamUserAnswerAttributes, ExamUserAnswerCreationAttributes>
  implements ExamUserAnswerAttributes
{
  public id!: number;
  public user_id!: number;
  public question_id!: number;
  public answer_text?: string;
  public answer_option_id?: number;
  public status!: ExamUserAnswerStatus;
  public is_correct?: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ExamUserAnswer.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    question_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    answer_text: { type: DataTypes.TEXT, allowNull: true },
    answer_option_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected", "auto_approved"),
      defaultValue: "pending",
    },
    is_correct: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "exam_users_answers",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default ExamUserAnswer;
