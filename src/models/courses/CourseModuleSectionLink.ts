import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";

export type SectionLinkType = "video" | "image" | "text" | "link" | "audio";

interface CourseModuleSectionLinkAttributes {
  id: number;
  link: string;
  type: SectionLinkType;
  course_module_section_id: number;
  created_at?: Date;
  updated_at?: Date;
}

interface CourseModuleSectionLinkCreationAttributes
  extends Optional<CourseModuleSectionLinkAttributes, "id" | "type"> {}

class CourseModuleSectionLink
  extends Model<
    CourseModuleSectionLinkAttributes,
    CourseModuleSectionLinkCreationAttributes
  >
  implements CourseModuleSectionLinkAttributes
{
  public id!: number;
  public link!: string;
  public type!: SectionLinkType;
  public course_module_section_id!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

CourseModuleSectionLink.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    link: { type: DataTypes.TEXT, allowNull: false },
    type: {
      type: DataTypes.ENUM("video", "image", "text", "link", "audio"),
      defaultValue: "text",
    },
    course_module_section_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "courses_modules_sections_links",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default CourseModuleSectionLink;
