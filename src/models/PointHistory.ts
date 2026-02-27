import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PointHistoryAttributes {
  id: number;
  user_id: number;
  points: number;
  action: 'earned' | 'spent' | 'adjusted';
  description: string;
  created_at?: Date;
}

interface PointHistoryCreationAttributes extends Optional<PointHistoryAttributes, 'id'> {}

class PointHistory
  extends Model<PointHistoryAttributes, PointHistoryCreationAttributes>
  implements PointHistoryAttributes
{
  public id!: number;
  public user_id!: number;
  public points!: number;
  public action!: 'earned' | 'spent' | 'adjusted';
  public description!: string;
  public readonly created_at!: Date;
}

PointHistory.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    points: { type: DataTypes.INTEGER, allowNull: false },
    action: {
      type: DataTypes.ENUM('earned', 'spent', 'adjusted'),
      allowNull: false,
    },
    description: { type: DataTypes.STRING(255), allowNull: false },
  },
  {
    sequelize,
    tableName: 'point_history',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default PointHistory;
