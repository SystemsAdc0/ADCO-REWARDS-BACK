import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";

export type SectionContentType = "video" | "image" | "text" | "link" | "audio";

interface SectionContentAttributes {
  id: number;
  link: string;
  type: SectionContentType;
  section_id: number;
  sort_order: number;
  created_at?: Date;
  updated_at?: Date;
}

interface SectionContentCreationAttributes extends Optional<
  SectionContentAttributes,
  "id" | "type"
> {}

class SectionContent
  extends Model<SectionContentAttributes, SectionContentCreationAttributes>
  implements SectionContentAttributes
{
  public id!: number;
  public link!: string;
  public type!: SectionContentType;
  public section_id!: number;
  public sort_order!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

SectionContent.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    link: { type: DataTypes.TEXT, allowNull: false },
    type: {
      type: DataTypes.ENUM("video", "image", "text", "link", "audio"),
      allowNull: false,
      defaultValue: "text",
    },
    section_id: {
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
    tableName: "sections_content",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default SectionContent;
