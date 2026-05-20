import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";

export type ExamQuestionType = "multiple_choice" | "open";

interface ExamQuestionAttributes {
  id: number;
  question: string;
  type: ExamQuestionType;
  exam_id: number;
  sort_order: number;
  created_at?: Date;
  updated_at?: Date;
}

interface ExamQuestionCreationAttributes extends Optional<
  ExamQuestionAttributes,
  "id" | "type"
> {}

class ExamQuestion
  extends Model<ExamQuestionAttributes, ExamQuestionCreationAttributes>
  implements ExamQuestionAttributes
{
  public id!: number;
  public question!: string;
  public type!: ExamQuestionType;
  public exam_id!: number;
  public sort_order!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ExamQuestion.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    question: { type: DataTypes.STRING(100), allowNull: false },
    type: {
      type: DataTypes.ENUM("multiple_choice", "open"),
      defaultValue: "multiple_choice",
    },
    exam_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "exam_questions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default ExamQuestion;
