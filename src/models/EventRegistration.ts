import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface EventRegistrationAttributes {
  id: number;
  event_id: number;
  user_id: number;
  created_at?: Date;
  updated_at?: Date;
}

interface EventRegistrationCreationAttributes
  extends Optional<EventRegistrationAttributes, "id"> {}

class EventRegistration
  extends Model<
    EventRegistrationAttributes,
    EventRegistrationCreationAttributes
  >
  implements EventRegistrationAttributes
{
  public id!: number;
  public event_id!: number;
  public user_id!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

EventRegistration.init(
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

    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "event_registrations",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default EventRegistration;