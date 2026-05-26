import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface LocationImageAttributes {
  id: number;
  event_id: number;
  url: string;

  created_at?: Date;
  updated_at?: Date;
}

interface LocationImageCreationAttributes
  extends Optional<LocationImageAttributes, "id"> {}

class LocationImage
  extends Model<
    LocationImageAttributes,
    LocationImageCreationAttributes
  >
  implements LocationImageAttributes
{
  public id!: number;

  public event_id!: number;
  public url!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

LocationImage.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    event_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "location_images",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default LocationImage;