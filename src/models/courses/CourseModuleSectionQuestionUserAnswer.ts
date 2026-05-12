import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";

export type UserAnswerStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "auto_approved";

interface CourseModuleSectionQuestionUserAnswerAttributes {
  id: number;
  user_id: number;
  question_id: number;
  answer_text?: string;
  answer_option_id?: number;
  status: UserAnswerStatus;
  created_at?: Date;
  updated_at?: Date;
}

interface CourseModuleSectionQuestionUserAnswerCreationAttributes
  extends Optional<
    CourseModuleSectionQuestionUserAnswerAttributes,
    "id" | "answer_text" | "answer_option_id" | "status"
  > {}

class CourseModuleSectionQuestionUserAnswer
  extends Model<
    CourseModuleSectionQuestionUserAnswerAttributes,
    CourseModuleSectionQuestionUserAnswerCreationAttributes
  >
  implements CourseModuleSectionQuestionUserAnswerAttributes
{
  public id!: number;
  public user_id!: number;
  public question_id!: number;
  public answer_text?: string;
  public answer_option_id?: number;
  public status!: UserAnswerStatus;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

CourseModuleSectionQuestionUserAnswer.init(
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
  },
  {
    sequelize,
    tableName: "courses_modules_sections_questions_users_answers",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default CourseModuleSectionQuestionUserAnswer;
