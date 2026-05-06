import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import { UserRole, UserStatus } from "../types";

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  points: number;
  status: UserStatus;
  avatar?: string;
  can_request_points?: boolean;
  birth_date?: string;
  company?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface UserCreationAttributes extends Optional<
  UserAttributes,
  "id" | "points" | "status" | "avatar" | "can_request_points" | "birth_date" | "company"
> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: UserRole;
  public points!: number;
  public status!: UserStatus;
  public avatar?: string;
  public can_request_points?: boolean;
  public birth_date?: string;
  public company?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },

    password: { type: DataTypes.STRING(255), allowNull: false },
    role: {
      type: DataTypes.ENUM("admin", "moderator", "user", "visitor", "developer"),
      defaultValue: "user",
    },
    points: { type: DataTypes.INTEGER, defaultValue: 0 },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
    },
    avatar: { type: DataTypes.STRING(255), allowNull: true },
    can_request_points: { type: DataTypes.BOOLEAN, defaultValue: false },
    birth_date: { type: DataTypes.DATEONLY, allowNull: true },
    company: { type: DataTypes.STRING(100), allowNull: true },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default User;
