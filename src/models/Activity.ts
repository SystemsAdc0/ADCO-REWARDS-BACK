import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import { ActivityStatus } from "../types";

interface ActivityAttributes {
  id: number;
  name: string;
  description: string;
  points_reward: number;
  start_date: Date;
  end_date: Date;
  time_zone: string;
  status: ActivityStatus;
  category: string;
  image: string;
  counts_for_travel: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface ActivityCreationAttributes extends Optional<
  ActivityAttributes,
  "id" | "status" | "counts_for_travel" | "time_zone"
> {}

class Activity
  extends Model<ActivityAttributes, ActivityCreationAttributes>
  implements ActivityAttributes
{
  public id!: number;
  public name!: string;
  public description!: string;
  public points_reward!: number;
  public start_date!: Date;
  public category!: string;
  public image!: string;
  public end_date!: Date;
  public time_zone!: string;
  public status!: ActivityStatus;
  public counts_for_travel!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Activity.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(150), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    category: { type: DataTypes.STRING(100), allowNull: false },
    image: { type: DataTypes.TEXT, allowNull: false },

    points_reward: { type: DataTypes.INTEGER, allowNull: false },
    start_date: { type: DataTypes.DATE, allowNull: false },

    end_date: { type: DataTypes.DATE, allowNull: false },
    time_zone: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "America/Tijuana",
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "finished"), 
      defaultValue: "active",
    },
    counts_for_travel: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "activities",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default Activity;
