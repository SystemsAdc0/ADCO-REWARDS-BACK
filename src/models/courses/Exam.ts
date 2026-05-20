import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";

export type ExamType = "diagnostic" | "partial" | "final" | "practice";

interface ExamAttributes {
  id: number;
  type: ExamType;
  section_id: number;
  passing_score: number;
  counts_for_grade: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface ExamCreationAttributes extends Optional<
  ExamAttributes,
  "id" | "type"
> {}

class Exam
  extends Model<ExamAttributes, ExamCreationAttributes>
  implements ExamAttributes
{
  public id!: number;
  public type!: ExamType;
  public section_id!: number;
  public passing_score!: number;
  public counts_for_grade!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Exam.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM("diagnostic", "partial", "final", "practice"),
      allowNull: false,
      defaultValue: "practice",
    },
    section_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    passing_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    counts_for_grade: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "exams",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default Exam;
