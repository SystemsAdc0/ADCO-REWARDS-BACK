import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
interface ChildrenDayVoteEntryAttributes {
  id: number;
  children_day_id: number;
  user_id: number;
  created_at?: Date;
  updated_at?: Date;
}
interface ChildrenDayVotesCreationAttributes extends Optional<
  ChildrenDayVoteEntryAttributes,
  "id"
> {}
class ChildrenDayVotes
  extends Model<
    ChildrenDayVoteEntryAttributes,
    ChildrenDayVotesCreationAttributes
  >
  implements ChildrenDayVoteEntryAttributes
{
  public id!: number;
  public children_day_id!: number;
  public user_id!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ChildrenDayVotes.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    children_day_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  },
  {
    sequelize,
    tableName: "children_day_votes",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default ChildrenDayVotes;
