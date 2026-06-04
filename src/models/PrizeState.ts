import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface PrizeStateAttributes {
  id: number;
  prize_id: number;
  state_id: number;
  created_at?: Date;
  updated_at?: Date;
}

interface PrizeStateCreationAttributes extends Optional<
  PrizeStateAttributes,
  "id"
> {}

class PrizeState
  extends Model<PrizeStateAttributes, PrizeStateCreationAttributes>
  implements PrizeStateAttributes
{
  public id!: number;
  public prize_id!: number;
  public state_id!: number;
  public readonly created_at?: Date;
  public readonly updated_at?: Date;
}

PrizeState.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    prize_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    state_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "prizes_states",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default PrizeState;
