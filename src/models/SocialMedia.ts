import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface SocialMediaAttributes {
  id: number;
  activity_id: number;
  name: "whatsapp" | "instagram" | "engage" | "platform";
}

interface SocialMediaCreationAttributes extends Optional<
  SocialMediaAttributes,
  "id"
> {}
 
class SocialMedia
  extends Model<SocialMediaAttributes, SocialMediaCreationAttributes>
  implements SocialMediaAttributes
{
  public id!: number;
  public activity_id!: number;
  public name!: "whatsapp" | "instagram" | "engage" | "platform";
}

SocialMedia.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    activity_id: {
      type: DataTypes.INTEGER.UNSIGNED, 
      allowNull: false,
      references: {
        model: "activities",
        key: "id",
      },
    },
    name: {
      type: DataTypes.ENUM("whatsapp", "instagram", "engage", "platform"),
      allowNull: false,
      defaultValue: "platform",
    },
  },
  {
    sequelize,
    modelName: "SocialMedia",
    tableName: "social_media",
    timestamps: false,
  },
);

export default SocialMedia;
