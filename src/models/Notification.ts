import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface NotificationAttributes {
  id: number;
  user_id: number;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  created_at?: Date;
}

interface NotificationCreationAttributes
  extends Optional<NotificationAttributes, 'id' | 'type' | 'read'> {}

class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  public id!: number;
  public user_id!: number;
  public message!: string;
  public type!: 'info' | 'success' | 'warning';
  public read!: boolean;
  public readonly created_at!: Date;
}

Notification.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    message: { type: DataTypes.STRING(500), allowNull: false },
    type: {
      type: DataTypes.ENUM('info', 'success', 'warning'),
      defaultValue: 'info',
    },
    read: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    tableName: 'notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default Notification;
