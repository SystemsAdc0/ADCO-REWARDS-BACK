import { Request, Response } from "express";
import { AuthRequest } from "../../types";
import Section from "../../models/courses/Section";
import Module from "../../models/courses/Module";
import SectionContent from "../../models/courses/SectionContent";
import Exam from "../../models/courses/Exam";

export const getSections = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const where: Record<string, unknown> = {};
    if (req.query.module_id) where.module_id = req.query.module_id;

    const sections = await Section.findAll({
      where,
      include: [{ model: Module, as: "module", attributes: ["id", "name"] }],
      order: [["sort_order", "ASC"]],
    });
    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getSectionById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const section = await Section.findByPk(String(req.params.id), {
      include: [
        { model: Module, as: "module", attributes: ["id", "name"] },
        { model: SectionContent, as: "contents" },
        { model: Exam, as: "exam" },
      ],
    });
    if (!section) {
      res.status(404).json({ message: "Sección no encontrada" });
      return;
    }
    res.json(section);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const createSection = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, type, module_id } = req.body;
    const module = await Module.findByPk(module_id);
    if (!module) {
      res.status(404).json({ message: "Módulo no encontrado" });
      return;
    }
    const lastSection = await Section.findOne({
      where: { module_id },
      order: [["sort_order", "DESC"]],
    });
    const sort_order = lastSection ? lastSection.sort_order + 1 : 1;
    const section = await Section.create({
      name: name.trim(),
      type,
      module_id,
      sort_order,
    });
    res.status(201).json(section);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error", error: err });
  }
};

export const updateSection = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const section = await Section.findByPk(String(req.params.id));
    if (!section) {
      res.status(404).json({ message: "Sección no encontrada" });
      return;
    }
    await section.update(req.body);
    res.json(section);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const reorderSections = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { sections } = req.body;    

    if (!Array.isArray(sections)) {
      res.status(400).json({
        message: "Formato inválido",
      });
      return;
    }

    for (const item of sections) {
      if (typeof item.id !== "number" || typeof item.sort_order !== "number") {
        res.status(400).json({
          message: "Datos inválidos",
        });
        return;
      }
    }

    await Promise.all(
      sections.map((section) =>
        Section.update(
          {
            sort_order: section.sort_order,
          },
          {
            where: {
              id: section.id,
            },
          },
        ),
      ),
    );

    res.json({
      message: "Orden actualizado correctamente",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Error",
      error: err,
    });
  }
};

// Checar la relación si tiene ON DELETE
export const deleteSection = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const section = await Section.findByPk(String(req.params.id));
    if (!section) {
      res.status(404).json({ message: "Sección no encontrada" });
      return;
    }
    await section.destroy();
    res.json({ message: "Sección eliminada" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};
