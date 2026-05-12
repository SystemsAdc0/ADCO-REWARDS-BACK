import { Request, Response } from "express";
import { AuthRequest } from "../../types";
import CourseModuleSectionActivity from "../../models/courses/CourseModuleSectionActivity";
import CourseModuleSection from "../../models/courses/CourseModuleSection";

export const getActivities = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const where: Record<string, unknown> = {};
    if (req.query.course_module_section_id)
      where.course_module_section_id = req.query.course_module_section_id;

    const activities = await CourseModuleSectionActivity.findAll({
      where,
      order: [["id", "ASC"]],
    });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getActivityById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const activity = await CourseModuleSectionActivity.findByPk(
      String(req.params.id),
    );
    if (!activity) {
      res.status(404).json({ message: "Actividad no encontrada" });
      return;
    }
    res.json(activity);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const createActivity = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, description, type, course_module_section_id } = req.body;
    const section = await CourseModuleSection.findByPk(
      course_module_section_id,
    );
    if (!section) {
      res.status(404).json({ message: "Sección no encontrada" });
      return;
    }
    const activity = await CourseModuleSectionActivity.create({
      name: name.trim(),
      description,
      type,
      course_module_section_id,
    });
    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const updateActivity = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const activity = await CourseModuleSectionActivity.findByPk(
      String(req.params.id),
    );
    if (!activity) {
      res.status(404).json({ message: "Actividad no encontrada" });
      return;
    }
    await activity.update(req.body);
    res.json(activity);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const deleteActivity = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const activity = await CourseModuleSectionActivity.findByPk(
      String(req.params.id),
    );
    if (!activity) {
      res.status(404).json({ message: "Actividad no encontrada" });
      return;
    }
    await activity.destroy();
    res.json({ message: "Actividad eliminada" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};
