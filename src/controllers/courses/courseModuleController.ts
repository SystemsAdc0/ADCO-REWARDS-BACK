import { Request, Response } from "express";
import { AuthRequest } from "../../types";
import CourseModule from "../../models/courses/CourseModule";
import Course from "../../models/courses/Course";
import CourseModuleSection from "../../models/courses/CourseModuleSection";

export const getCourseModules = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const where: Record<string, unknown> = {};
    if (req.query.course_id) where.course_id = req.query.course_id;

    const modules = await CourseModule.findAll({
      where,
      include: [{ model: Course, as: "course", attributes: ["id", "name"] }],
      order: [["id", "ASC"]],
    });
    res.json(modules);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getCourseModuleById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const module = await CourseModule.findByPk(String(req.params.id), {
      include: [
        { model: Course, as: "course", attributes: ["id", "name"] },
        { model: CourseModuleSection, as: "sections", order: [["id", "ASC"]] },
      ],
    });
    if (!module) {
      res.status(404).json({ message: "Módulo no encontrado" });
      return;
    }
    res.json(module);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const createCourseModule = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, introduction, image, course_id } = req.body;
    const course = await Course.findByPk(course_id);
    if (!course) {
      res.status(404).json({ message: "Curso no encontrado" });
      return;
    }
    const module = await CourseModule.create({
      name: name.trim(),
      introduction,
      image,
      course_id,
    });
    res.status(201).json(module);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const updateCourseModule = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const module = await CourseModule.findByPk(String(req.params.id));
    if (!module) {
      res.status(404).json({ message: "Módulo no encontrado" });
      return;
    }
    await module.update(req.body);
    res.json(module);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const deleteCourseModule = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const module = await CourseModule.findByPk(String(req.params.id));
    if (!module) {
      res.status(404).json({ message: "Módulo no encontrado" });
      return;
    }
    await module.destroy();
    res.json({ message: "Módulo eliminado" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};
