import { Model, Optional, DataTypes } from "sequelize";
import sequelize from "../config/database";
interface AgreementAttributes {
  id: number;
  name: string;
  image?: string;
  description: string;
  page?: string;
  created_at?: Date;
}

interface AgreementEntryCreationAttributes extends Optional<
  AgreementAttributes,
  "id" | "image" | "page" | "created_at"
> {}

class Agreement
  extends Model<AgreementAttributes, AgreementEntryCreationAttributes>
  implements AgreementAttributes
{
  public id!: number;
  public name!: string;
  public image?: string;
  public description!: string;
  public page?: string;
  public created_at?: Date | undefined;
}

Agreement.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: true },
    description: { type: DataTypes.STRING, allowNull: false },
    page: { type: DataTypes.STRING, allowNull: true },
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
