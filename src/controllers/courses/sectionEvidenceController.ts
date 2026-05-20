import { Request, Response } from "express";
import { AuthRequest } from "../../types";
import SectionEvidence from "../../models/courses/SectionEvidence";
import Section from "../../models/courses/Section";
import { User } from "../../models";

export const getEvidence = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const where: Record<string, unknown> = {};
    if (req.query.section_id) where.section_id = req.query.section_id;
    if (req.query.status) where.status = req.query.status;

    if (req.user?.role === "user") where.user_id = req.user.id;

    const evidence = await SectionEvidence.findAll({
      where,
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
        { model: User, as: "reviewer", attributes: ["id", "name", "email"] },
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
    const evidence = await SectionEvidence.findByPk(String(req.params.id), {
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
        { model: User, as: "reviewer", attributes: ["id", "name", "email"] },
      ],
    });
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
    const { section_id, evidence } = req.body;
    const section = await Section.findByPk(section_id);
    if (!section) {
      res.status(404).json({ message: "Actividad no encontrada" });
      return;
    }

    if (section.type !== "evidence") {
      res.status(400).json({
        message: "La sección no es de tipo evidencia",
      });
      return;
    }

    const created = await SectionEvidence.create({
      user_id: req.user!.id,
      section_id,
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
    const evidence = await SectionEvidence.findByPk(String(req.params.id));
    if (!evidence) {
      res.status(404).json({ message: "Evidencia no encontrada" });
      return;
    }
    if (!["approved", "rejected"].includes(status)) {
      res.status(400).json({
        message: "Estado inválido",
      });
      return;
    }
    await evidence.update({
      status,
      reviewed_by: req.user!.id,
    });
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
    const evidence = await SectionEvidence.findByPk(
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
