import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";

interface DepartmentAttributes {
  id: number;
  name: string;
  created_at?: Date;
  updated_at?: Date;
}

interface DepartmentCreationAttributes
  extends Optional<DepartmentAttributes, "id"> {}

class Department
  extends Model<DepartmentAttributes, DepartmentCreationAttributes>
  implements DepartmentAttributes
{
  public id!: number;
  public name!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Department.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(100), allowNull: false },
  },
  {
    sequelize,
    tableName: "departments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default Department;
