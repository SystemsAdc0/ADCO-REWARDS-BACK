import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface PointRequestAttributes {
  id: number;
  requester_id: number;
  target_id: number;
  points: number;
  message?: string;
  status: "pending" | "accepted" | "rejected";
  created_at?: Date;
  updated_at?: Date;
}
 
interface PointRequestCreationAttributes
  extends Optional<PointRequestAttributes, "id" | "message" | "status"> {}

class PointRequest
  extends Model<PointRequestAttributes, PointRequestCreationAttributes>
  implements PointRequestAttributes
{
  public id!: number;
  public requester_id!: number;
  public target_id!: number;
  public points!: number;
  public message?: string;
  public status!: "pending" | "accepted" | "rejected";
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

PointRequest.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    requester_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    target_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    points: { type: DataTypes.INTEGER, allowNull: false },
    message: { type: DataTypes.STRING(500), allowNull: true },
    status: {
      type: DataTypes.ENUM("pending", "accepted", "rejected"),
      defaultValue: "pending",
    },
  },
  {
    sequelize,
    tableName: "point_requests",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default PointRequest;
