import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";

interface CourseModuleAttributes {
  id: number;
  name: string;
  introduction: string;
  image?: string;
  course_id: number;
  created_at?: Date;
  updated_at?: Date;
}

interface CourseModuleCreationAttributes
  extends Optional<CourseModuleAttributes, "id" | "image"> {}

class CourseModule
  extends Model<CourseModuleAttributes, CourseModuleCreationAttributes>
  implements CourseModuleAttributes
{
  public id!: number;
  public name!: string;
  public introduction!: string;
  public image?: string;
  public course_id!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

CourseModule.init(
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
  },
  {
    sequelize,
    tableName: "courses_modules",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default CourseModule;
