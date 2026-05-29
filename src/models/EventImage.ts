import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface EventImageAttributes {
  id: number;
  event_id: number;
  url: string;
  object_name: string;
  created_at?: Date;
  updated_at?: Date;
}

interface EventImageCreationAttributes extends Optional<
  EventImageAttributes,
  "id"
> {}

class EventImage
  extends Model<EventImageAttributes, EventImageCreationAttributes>
  implements EventImageAttributes
{
  public id!: number;
  public event_id!: number;
  public url!: string;
  public object_name!: string;
  public readonly created_at?: Date;
  public readonly updated_at?: Date;
}

EventImage.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    event_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    object_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "event_images",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default EventImage;
