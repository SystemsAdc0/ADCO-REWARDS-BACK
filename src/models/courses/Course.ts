import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";
import { CourseStatus } from "../../types";

interface CourseAttributes {
  id: number;
  name: string;
  department_id: number;
  status: CourseStatus;
  created_at?: Date;
  updated_at?: Date;
}

interface CourseCreationAttributes extends Optional<
  CourseAttributes,
  "id" | "status"
> {}

class Course
  extends Model<CourseAttributes, CourseCreationAttributes>
  implements CourseAttributes
{
  public id!: number;
  public name!: string;
  public department_id!: number;
  public status!: CourseStatus;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Course.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(100), allowNull: false },
    department_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    status: {
      type: DataTypes.ENUM("draft", "published", "archived"),
      allowNull: false,
      defaultValue: "draft",
    },
  },
  {
    sequelize,
    tableName: "courses",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default Course;
