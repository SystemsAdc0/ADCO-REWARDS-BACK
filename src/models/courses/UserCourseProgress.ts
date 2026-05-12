import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";

interface UserCourseProgressAttributes {
  id: number;
  user_id: number;
  course_module_section_id: number;
  completed_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

interface UserCourseProgressCreationAttributes
  extends Optional<UserCourseProgressAttributes, "id" | "completed_at"> {}

class UserCourseProgress
  extends Model<
    UserCourseProgressAttributes,
    UserCourseProgressCreationAttributes
  >
  implements UserCourseProgressAttributes
{
  public id!: number;
  public user_id!: number;
  public course_module_section_id!: number;
  public completed_at!: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

UserCourseProgress.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    course_module_section_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    completed_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: "courses_user_progress",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { unique: true, fields: ["user_id", "course_module_section_id"] },
    ],
  },
);

export default UserCourseProgress;
