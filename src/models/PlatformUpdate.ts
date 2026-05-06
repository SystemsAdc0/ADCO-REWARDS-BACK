import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

type UpdateType = "info" | "success" | "warning";

interface PlatformUpdateAttributes {
  id: number;
  title: string;
  message: string;
  type: UpdateType;
  sent_by: number;
  created_at?: Date;
}

interface PlatformUpdateCreationAttributes
  extends Optional<PlatformUpdateAttributes, "id"> {}

class PlatformUpdate
  extends Model<PlatformUpdateAttributes, PlatformUpdateCreationAttributes>
  implements PlatformUpdateAttributes
{
  public id!: number;
  public title!: string;
  public message!: string;
  public type!: UpdateType;
  public sent_by!: number;
  public readonly created_at!: Date;
}

PlatformUpdate.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(200), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    type: {
      type: DataTypes.ENUM("info", "success", "warning"),
      defaultValue: "info",
    },
    sent_by: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  },
  {
    sequelize,
    tableName: "platform_updates",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  },
);

export default PlatformUpdate;
