import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";

interface ExamAnswerAttributes {
  id: number;
  answer: string;
  is_correct: boolean;
  question_id: number;
  created_at?: Date;
  updated_at?: Date;
}

interface ExamAnswerCreationAttributes
  extends Optional<
    ExamAnswerAttributes,
    "id" | "is_correct"
  > {}

class ExamAnswer
  extends Model<
    ExamAnswerAttributes,
    ExamAnswerCreationAttributes
  >
  implements ExamAnswerAttributes
{
  public id!: number;
  public answer!: string;
  public is_correct!: boolean;
  public question_id!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ExamAnswer.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    answer: { type: DataTypes.STRING(100), allowNull: false },
    is_correct: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    question_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "exam_answers",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default ExamAnswer;
