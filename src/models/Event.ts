import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import { EventCategory } from "../types";

export type EventStatus = "active" | "inactive" | "cancelled";

interface EventAttributes {
  id: number;
  name: string;
  description: string;
  thumbnail: string;
  category: EventCategory;
  status: EventStatus;
  start_at: Date;
  end_at?: Date;
  location: string;
  registration_url?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface EventCreationAttributes extends Optional<
  EventAttributes,
  "id" | "status" | "end_at" | "registration_url"
> {}

class Event
  extends Model<EventAttributes, EventCreationAttributes>
  implements EventAttributes
{
  public id!: number;

  public name!: string;
  public description!: string;
  public thumbnail!: string;
  public category!: EventCategory;
  public status!: EventStatus;
  public start_at!: Date;
  public end_at!: Date;
  public location!: string;
  public registration_url!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Event.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    thumbnail: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM(
        "informative",
        "training",
        "social",
        "recreational",
        "team_building",
        "conference",
        "workshop",
        "celebration",
        "health_safety",
        "corporate",
        "community",
        "other",
      ),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "cancelled"),
      allowNull: false,
      defaultValue: "active",
    },
    start_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    location: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    registration_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "events",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default Event;
