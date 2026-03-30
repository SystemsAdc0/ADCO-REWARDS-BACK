import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import { PrizeStatus } from "../types";

interface PrizeAttributes {
  id: number;
  name: string;
  description: string;
  image?: string;
  points_required: number;
  stock: number;
  allow_multiple_redemptions: boolean;
  status: PrizeStatus;
  created_at?: Date;
  updated_at?: Date;
}

interface PrizeCreationAttributes extends Optional<
  PrizeAttributes,
  "id" | "image" | "status"
> {}
class Prize
  extends Model<PrizeAttributes, PrizeCreationAttributes>
  implements PrizeAttributes
{
  public id!: number;
  public name!: string;
  public description!: string;
  public image!: string;
  public points_required!: number;
  public allow_multiple_redemptions!: boolean;
  public stock!: number;
  public status!: PrizeStatus;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Prize.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(150), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    image: { type: DataTypes.STRING(355), allowNull: true },
    points_required: { type: DataTypes.INTEGER, allowNull: false },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    allow_multiple_redemptions: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
    },
  },
  {
    sequelize, 
    tableName: "prizes",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default Prize;
