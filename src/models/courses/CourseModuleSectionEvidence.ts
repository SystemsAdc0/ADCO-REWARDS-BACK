import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";

export type EvidenceStatus = "approved" | "rejected" | "pending";

interface CourseModuleSectionEvidenceAttributes {
  id: number;
  user_id: number;
  course_module_section_activity_id: number;
  evidence: string;
  status: EvidenceStatus;
  created_at?: Date;
  updated_at?: Date;
}

interface CourseModuleSectionEvidenceCreationAttributes
  extends Optional<
    CourseModuleSectionEvidenceAttributes,
    "id" | "status"
  > {}

class CourseModuleSectionEvidence
  extends Model<
    CourseModuleSectionEvidenceAttributes,
    CourseModuleSectionEvidenceCreationAttributes
  >
  implements CourseModuleSectionEvidenceAttributes
{
  public id!: number;
  public user_id!: number;
  public course_module_section_activity_id!: number;
  public evidence!: string;
  public status!: EvidenceStatus;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

CourseModuleSectionEvidence.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    course_module_section_activity_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    evidence: { type: DataTypes.TEXT, allowNull: false },
    status: {
      type: DataTypes.ENUM("approved", "rejected", "pending"),
      defaultValue: "pending",
    },
  },
  {
    sequelize,
    tableName: "courses_modules_sections_evidence",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default CourseModuleSectionEvidence;
