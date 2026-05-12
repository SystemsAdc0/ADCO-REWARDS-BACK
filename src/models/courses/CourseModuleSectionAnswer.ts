import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";

interface CourseModuleSectionAnswerAttributes {
  id: number;
  answer: string;
  is_correct: boolean;
  course_module_section_question_id: number;
  created_at?: Date;
  updated_at?: Date;
}

interface CourseModuleSectionAnswerCreationAttributes
  extends Optional<
    CourseModuleSectionAnswerAttributes,
    "id" | "is_correct"
  > {}

class CourseModuleSectionAnswer
  extends Model<
    CourseModuleSectionAnswerAttributes,
    CourseModuleSectionAnswerCreationAttributes
  >
  implements CourseModuleSectionAnswerAttributes
{
  public id!: number;
  public answer!: string;
  public is_correct!: boolean;
  public course_module_section_question_id!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

CourseModuleSectionAnswer.init(
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
    course_module_section_question_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "courses_modules_sections_answers",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default CourseModuleSectionAnswer;
