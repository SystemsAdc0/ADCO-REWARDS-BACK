import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import { RedemptionStatus } from "../types";
import User from "./User";

interface RedemptionAttributes {
  id: number;
  user_id: number;
  prize_id: number;
  status: RedemptionStatus;
  points_spent: number;
  notes?: string;
  redeemed_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

interface RedemptionCreationAttributes extends Optional<
  RedemptionAttributes,
  "id" | "status" | "notes" | "redeemed_at"
> {}

class Redemption
  extends Model<RedemptionAttributes, RedemptionCreationAttributes>
  implements RedemptionAttributes
{
  public id!: number;
  public user_id!: number;
  public prize_id!: number;
  public status!: RedemptionStatus;
  public points_spent!: number;
  public notes?: string;
  public redeemed_at?: Date;
  public user?: User;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Redemption.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    prize_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    status: {
      type: DataTypes.ENUM("pending", "approved", "delivered", "rejected"),
      defaultValue: "pending",
    },
    points_spent: { type: DataTypes.INTEGER, allowNull: false },
    notes: { type: DataTypes.TEXT, allowNull: true },
    redeemed_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: "redemptions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default Redemption;
