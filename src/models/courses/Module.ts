import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";

interface ModuleAttributes {
  id: number;
  name: string;
  introduction: string;
  image?: string;
  course_id: number;
  sort_order: number;
  min_correct_to_advance?: number;
  created_at?: Date;
  updated_at?: Date;
}

interface ModuleCreationAttributes extends Optional<
  ModuleAttributes,
  "id" | "image" | "min_correct_to_advance"
> {}

class Module
  extends Model<ModuleAttributes, ModuleCreationAttributes>
  implements ModuleAttributes
{
  public id!: number;
  public name!: string;
  public introduction!: string;
  public image?: string;
  public course_id!: number;
  public sort_order!: number;
  public min_correct_to_advance?: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Module.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(100), allowNull: false },
    introduction: { type: DataTypes.TEXT, allowNull: false },
    image: { type: DataTypes.TEXT, allowNull: true },
    course_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    min_correct_to_advance: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    sequelize,
    tableName: "modules",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default Module;
