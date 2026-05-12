import { Request, Response } from "express";
import { AuthRequest } from "../../types";
import CourseModuleSection from "../../models/courses/CourseModuleSection";
import CourseModule from "../../models/courses/CourseModule";
import CourseModuleSectionLink from "../../models/courses/CourseModuleSectionLink";
import CourseModuleSectionActivity from "../../models/courses/CourseModuleSectionActivity";

export const getSections = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const where: Record<string, unknown> = {};
    if (req.query.course_module_id)
      where.course_module_id = req.query.course_module_id;

    const sections = await CourseModuleSection.findAll({
      where,
      include: [
        { model: CourseModule, as: "module", attributes: ["id", "name"] },
      ],
      order: [["id", "ASC"]],
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
    const section = await CourseModuleSection.findByPk(String(req.params.id), {
      include: [
        { model: CourseModule, as: "module", attributes: ["id", "name"] },
        { model: CourseModuleSectionLink, as: "links" },
        { model: CourseModuleSectionActivity, as: "activities" },
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
    const { name, type, course_module_id } = req.body;
    const module = await CourseModule.findByPk(course_module_id);
    if (!module) {
      res.status(404).json({ message: "Módulo no encontrado" });
      return;
    }
    const section = await CourseModuleSection.create({
      name: name.trim(),
      type,
      course_module_id,
    });
    res.status(201).json(section);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const updateSection = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const section = await CourseModuleSection.findByPk(String(req.params.id));
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

export const deleteSection = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const section = await CourseModuleSection.findByPk(String(req.params.id));
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
