import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";

export type CourseSectionType = "activity" | "information" | "story";

interface CourseModuleSectionAttributes {
  id: number;
  name: string;
  type: CourseSectionType;
  course_module_id: number;
  created_at?: Date;
  updated_at?: Date;
}

interface CourseModuleSectionCreationAttributes
  extends Optional<CourseModuleSectionAttributes, "id" | "type"> {}

class CourseModuleSection
  extends Model<
    CourseModuleSectionAttributes,
    CourseModuleSectionCreationAttributes
  >
  implements CourseModuleSectionAttributes
{
  public id!: number;
  public name!: string;
  public type!: CourseSectionType;
  public course_module_id!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

CourseModuleSection.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(100), allowNull: false },
    type: {
      type: DataTypes.ENUM("activity", "information", "story"),
      defaultValue: "activity",
    },
    course_module_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  },
  {
    sequelize,
    tableName: "courses_modules_sections",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default CourseModuleSection;
