import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface AgreementImageAttributes {
  id: number;
  agreement_id: number;
  url: string;
  object_name: string;
  is_logo: boolean;
  position: number;
  created_at?: Date;
}

interface AgreementImageCreationAttributes
  extends Optional<AgreementImageAttributes, "id" | "is_logo" | "position"> {}

class AgreementImage
  extends Model<AgreementImageAttributes, AgreementImageCreationAttributes>
  implements AgreementImageAttributes
{
  public id!: number;
  public agreement_id!: number;
  public url!: string;
  public object_name!: string;
  public is_logo!: boolean;
  public position!: number;
  public readonly created_at!: Date;
}

AgreementImage.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    agreement_id: { type: DataTypes.INTEGER, allowNull: false },
    url: { type: DataTypes.STRING(1000), allowNull: false },
    object_name: { type: DataTypes.STRING(500), allowNull: false },
    is_logo: { type: DataTypes.BOOLEAN, defaultValue: false },
    position: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    sequelize,
    tableName: "agreement_images",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  },
);

export default AgreementImage;
