import { Request, Response } from "express";
import { AuthRequest } from "../../types";
import CourseModuleSectionEvidence from "../../models/courses/CourseModuleSectionEvidence";
import CourseModuleSectionActivity from "../../models/courses/CourseModuleSectionActivity";
import { User } from "../../models";

export const getEvidence = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const where: Record<string, unknown> = {};
    if (req.query.course_module_section_activity_id)
      where.course_module_section_activity_id =
        req.query.course_module_section_activity_id;
    if (req.query.status) where.status = req.query.status;

    if (req.user?.role === "user") where.user_id = req.user.id;

    const evidence = await CourseModuleSectionEvidence.findAll({
      where,
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
      ],
      order: [["id", "DESC"]],
    });
    res.json(evidence);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getEvidenceById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const evidence = await CourseModuleSectionEvidence.findByPk(
      String(req.params.id),
      {
        include: [
          { model: User, as: "user", attributes: ["id", "name", "email"] },
        ],
      },
    );
    if (!evidence) {
      res.status(404).json({ message: "Evidencia no encontrada" });
      return;
    }
    res.json(evidence);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const submitEvidence = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { course_module_section_activity_id, evidence } = req.body;
    const activity = await CourseModuleSectionActivity.findByPk(
      course_module_section_activity_id,
    );
    if (!activity) {
      res.status(404).json({ message: "Actividad no encontrada" });
      return;
    }
    const created = await CourseModuleSectionEvidence.create({
      user_id: req.user!.id,
      course_module_section_activity_id,
      evidence,
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const reviewEvidence = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { status } = req.body;
    const evidence = await CourseModuleSectionEvidence.findByPk(
      String(req.params.id),
    );
    if (!evidence) {
      res.status(404).json({ message: "Evidencia no encontrada" });
      return;
    }
    await evidence.update({ status });
    res.json(evidence);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const deleteEvidence = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const evidence = await CourseModuleSectionEvidence.findByPk(
      String(req.params.id),
    );
    if (!evidence) {
      res.status(404).json({ message: "Evidencia no encontrada" });
      return;
    }
    await evidence.destroy();
    res.json({ message: "Evidencia eliminada" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};
