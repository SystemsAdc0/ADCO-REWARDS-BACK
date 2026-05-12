import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";

export type ExamType = "diagnostic" | "partial" | "activity" | "final";

interface CourseModuleSectionExamAttributes {
  id: number;
  name: string;
  type: ExamType;
  passing_score: number;
  course_module_section_activity_id: number;
  created_at?: Date;
  updated_at?: Date;
}

interface CourseModuleSectionExamCreationAttributes
  extends Optional<CourseModuleSectionExamAttributes, "id"> {}

class CourseModuleSectionExam
  extends Model<
    CourseModuleSectionExamAttributes,
    CourseModuleSectionExamCreationAttributes
  >
  implements CourseModuleSectionExamAttributes
{
  public id!: number;
  public name!: string;
  public type!: ExamType;
  public passing_score!: number;
  public course_module_section_activity_id!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

CourseModuleSectionExam.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(100), allowNull: false },
    type: {
      type: DataTypes.ENUM("diagnostic", "partial", "activity", "final"),
      allowNull: false,
    },
    passing_score: { type: DataTypes.INTEGER, allowNull: false },
    course_module_section_activity_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "courses_modules_sections_exams",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default CourseModuleSectionExam;
