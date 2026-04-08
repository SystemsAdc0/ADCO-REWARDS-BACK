import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
interface ChildrenDayEntryAttributes {
  id: number;
  user_id: number;
  image: string;
  created_at?: Date;
  updated_at?: Date;
}
interface ActivityEntryCreationAttributes extends Optional<
  ChildrenDayEntryAttributes,
  "id"
> {}
class ChildrenDay
  extends Model<ChildrenDayEntryAttributes, ActivityEntryCreationAttributes>
  implements ChildrenDayEntryAttributes
{
  public id!: number;
  public user_id!: number;
  public image!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ChildrenDay.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },

    image: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    sequelize,
    tableName: "children_day",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default ChildrenDay;
