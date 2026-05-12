import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";

export type SectionActivityType = "questions" | "evidence" | "exam";

interface CourseModuleSectionActivityAttributes {
  id: number;
  name: string;
  description: string;
  type: SectionActivityType;
  course_module_section_id: number;
  created_at?: Date;
  updated_at?: Date;
}

interface CourseModuleSectionActivityCreationAttributes
  extends Optional<CourseModuleSectionActivityAttributes, "id"> {}

class CourseModuleSectionActivity
  extends Model<
    CourseModuleSectionActivityAttributes,
    CourseModuleSectionActivityCreationAttributes
  >
  implements CourseModuleSectionActivityAttributes
{
  public id!: number;
  public name!: string;
  public description!: string;
  public type!: SectionActivityType;
  public course_module_section_id!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

CourseModuleSectionActivity.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    type: {
      type: DataTypes.ENUM("questions", "evidence", "exam"),
      allowNull: false,
    },
    course_module_section_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "courses_modules_sections_activities",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default CourseModuleSectionActivity;
