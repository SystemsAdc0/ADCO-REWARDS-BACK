import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";

export type SectionEvidenceStatus = "approved" | "rejected" | "pending";

interface SectionEvidenceAttributes {
  id: number;
  user_id: number;
  section_id: number;
  evidence: string;
  status: SectionEvidenceStatus;
  reviewed_by?: number;
  created_at?: Date;
  updated_at?: Date;
}

interface SectionEvidenceCreationAttributes extends Optional<
  SectionEvidenceAttributes,
  "id" | "status" | "reviewed_by"
> {}

class SectionEvidence
  extends Model<SectionEvidenceAttributes, SectionEvidenceCreationAttributes>
  implements SectionEvidenceAttributes
{
  public id!: number;
  public user_id!: number;
  public section_id!: number;
  public evidence!: string;
  public status!: SectionEvidenceStatus;
  public reviewed_by?: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

SectionEvidence.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    section_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    evidence: { type: DataTypes.TEXT, allowNull: false },
    status: {
      type: DataTypes.ENUM("approved", "rejected", "pending"),
      defaultValue: "pending",
    },
    reviewed_by: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "sections_evidence",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default SectionEvidence;
