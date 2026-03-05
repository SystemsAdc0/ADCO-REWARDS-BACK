import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import { ActivityEntryStatus } from "../types";

interface ActivityEntryAttributes {
  id: number;
  user_id: number;
  activity_id: number;
  status: ActivityEntryStatus;
  reviewed_by?: number;
  review_notes?: string;
  file_name: string;
  created_at?: Date;
  updated_at?: Date;
}

interface ActivityEntryCreationAttributes extends Optional<
  ActivityEntryAttributes,
  "id" | "status" | "reviewed_by" | "review_notes"
> {}

class ActivityEntry
  extends Model<ActivityEntryAttributes, ActivityEntryCreationAttributes>
  implements ActivityEntryAttributes
{
  public id!: number;
  public user_id!: number;
  public activity_id!: number;
  public status!: ActivityEntryStatus;
  public reviewed_by?: number;
  public review_notes?: string;
  public file_name!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ActivityEntry.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    activity_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    file_name: { type: DataTypes.TEXT, allowNull: false },
    reviewed_by: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    review_notes: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    tableName: "activity_entries",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default ActivityEntry;
