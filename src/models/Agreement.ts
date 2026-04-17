import { Model, Optional, DataTypes } from "sequelize";
import sequelize from "../config/database";

interface AgreementAttributes {
  id: number;
  name: string;
  description: string;
  page?: string;
  maps_url?: string;
  created_at?: Date;
}

interface AgreementCreationAttributes extends Optional<
  AgreementAttributes,
  "id" | "page" | "maps_url" | "created_at"
> {}

class Agreement
  extends Model<AgreementAttributes, AgreementCreationAttributes>
  implements AgreementAttributes
{
  public id!: number;
  public name!: string;
  public description!: string;
  public page?: string;
  public maps_url?: string;
  public created_at?: Date | undefined;
}

Agreement.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT("long"), allowNull: false },
    page: { type: DataTypes.TEXT("long"), allowNull: true },
    maps_url: { type: DataTypes.STRING(500), allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false },
  },
  {
    sequelize,
    tableName: "agreements",
    timestamps: true,
    createdAt: "created_at",
  },
);
export default Agreement;
