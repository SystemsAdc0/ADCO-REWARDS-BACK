import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";

export type QuestionType = "multiple_choice" | "open";

interface CourseModuleSectionQuestionAttributes {
  id: number;
  question: string;
  type: QuestionType;
  course_module_section_exam_id: number;
  created_at?: Date;
  updated_at?: Date;
}

interface CourseModuleSectionQuestionCreationAttributes
  extends Optional<CourseModuleSectionQuestionAttributes, "id" | "type"> {}

class CourseModuleSectionQuestion
  extends Model<
    CourseModuleSectionQuestionAttributes,
    CourseModuleSectionQuestionCreationAttributes
  >
  implements CourseModuleSectionQuestionAttributes
{
  public id!: number;
  public question!: string;
  public type!: QuestionType;
  public course_module_section_exam_id!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

CourseModuleSectionQuestion.init(
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
    course_module_section_exam_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "courses_modules_sections_questions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default CourseModuleSectionQuestion;
