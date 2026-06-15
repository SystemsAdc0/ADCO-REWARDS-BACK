import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import { StateStatus } from "../types";

interface StateAttributes {
  id: number;
  name: string;
  status: StateStatus;
  created_at?: Date;
  updated_at?: Date;
}

interface StateCreationAttributes extends Optional<StateAttributes, "id" | "status"> {}

class State
  extends Model<StateAttributes, StateCreationAttributes>
  implements StateAttributes
{
  public id!: number;
  public name!: string;
  public status!: StateStatus;
  public readonly created_at?: Date;
  public readonly updated_at?: Date;
}

State.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
  },
  {
    sequelize,
    tableName: "states",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default State;
