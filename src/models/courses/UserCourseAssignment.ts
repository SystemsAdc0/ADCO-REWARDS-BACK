import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";

interface UserCourseAssignmentAttributes {
  id: number;
  user_id: number;
  course_id: number;
  created_at?: Date;
  updated_at?: Date;
}

interface UserCourseAssignmentCreationAttributes
  extends Optional<UserCourseAssignmentAttributes, "id"> {}

class UserCourseAssignment
  extends Model<
    UserCourseAssignmentAttributes,
    UserCourseAssignmentCreationAttributes
  >
  implements UserCourseAssignmentAttributes
{
  public id!: number;
  public user_id!: number;
  public course_id!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

UserCourseAssignment.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    course_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  },
  {
    sequelize,
    tableName: "user_course_assignments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [{ unique: true, fields: ["user_id", "course_id"] }],
  },
);

export default UserCourseAssignment;
