import { Request, Response } from "express";
import { AuthRequest } from "../../types";
import CourseModuleSectionLink from "../../models/courses/CourseModuleSectionLink";
import CourseModuleSection from "../../models/courses/CourseModuleSection";

export const getLinks = async (req: Request, res: Response): Promise<void> => {
  try {
    const where: Record<string, unknown> = {};
    if (req.query.course_module_section_id)
      where.course_module_section_id = req.query.course_module_section_id;

    const links = await CourseModuleSectionLink.findAll({
      where,
      order: [["id", "ASC"]],
    });
    res.json(links);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getLinkById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const link = await CourseModuleSectionLink.findByPk(String(req.params.id));
    if (!link) {
      res.status(404).json({ message: "Enlace no encontrado" });
      return;
    }
    res.json(link);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const createLink = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { link, type, course_module_section_id } = req.body;
    const section = await CourseModuleSection.findByPk(
      course_module_section_id,
    );
    if (!section) {
      res.status(404).json({ message: "Sección no encontrada" });
      return;
    }
    const created = await CourseModuleSectionLink.create({
      link,
      type,
      course_module_section_id,
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const updateLink = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const link = await CourseModuleSectionLink.findByPk(String(req.params.id));
    if (!link) {
      res.status(404).json({ message: "Enlace no encontrado" });
      return;
    }
    await link.update(req.body);
    res.json(link);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const deleteLink = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const link = await CourseModuleSectionLink.findByPk(String(req.params.id));
    if (!link) {
      res.status(404).json({ message: "Enlace no encontrado" });
      return;
    }
    await link.destroy();
    res.json({ message: "Enlace eliminado" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};
