import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface DuelCommentAttributes {
  id: number;
  user_id: number;
  body: string;
  created_at?: Date;
  updated_at?: Date;
}

interface DuelCommentCreationAttributes
  extends Optional<DuelCommentAttributes, "id"> {}

class DuelComment
  extends Model<DuelCommentAttributes, DuelCommentCreationAttributes>
  implements DuelCommentAttributes
{
  public id!: number;
  public user_id!: number;
  public body!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

DuelComment.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    body: { type: DataTypes.STRING(500), allowNull: false },
  },
  {
    sequelize,
    tableName: "duel_comments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default DuelComment;
