import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";

export type SectionType = "content" | "evidence" | "exam";

interface SectionAttributes {
  id: number;
  name: string;
  type: SectionType;
  module_id: number;
  sort_order: number;
  created_at?: Date;
  updated_at?: Date;
}

interface SectionCreationAttributes extends Optional<
  SectionAttributes,
  "id" | "type"
> {}

class Section
  extends Model<
    SectionAttributes,
    SectionCreationAttributes
  >
  implements SectionAttributes
{
  public id!: number;
  public name!: string;
  public type!: SectionType;
  public module_id!: number;
  public sort_order!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Section.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(100), allowNull: false },
    type: {
      type: DataTypes.ENUM("content", "evidence", "exam"),
      defaultValue: "content",
    },
    module_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "sections",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default Section;
