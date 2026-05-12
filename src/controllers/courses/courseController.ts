import { Request, Response } from "express";
import { AuthRequest } from "../../types";
import Course from "../../models/courses/Course";
import Department from "../../models/courses/Department";
import CourseModule from "../../models/courses/CourseModule";

export const getCourses = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const where: Record<string, unknown> = {};
    if (req.query.department_id) where.department_id = req.query.department_id;

    const courses = await Course.findAll({
      where,
      include: [
        { model: Department, as: "department", attributes: ["id", "name"] },
      ],
      order: [["id", "DESC"]],
    });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getCourseById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const course = await Course.findByPk(String(req.params.id), {
      include: [
        { model: Department, as: "department", attributes: ["id", "name"] },
        { model: CourseModule, as: "modules", order: [["id", "ASC"]] },
      ],
    });
    if (!course) {
      res.status(404).json({ message: "Curso no encontrado" });
      return;
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const createCourse = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, department_id } = req.body;
    const department = await Department.findByPk(department_id);
    if (!department) {
      res.status(404).json({ message: "Departamento no encontrado" });
      return;
    }
    const course = await Course.create({ name: name.trim(), department_id });
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const updateCourse = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const course = await Course.findByPk(String(req.params.id));
    if (!course) {
      res.status(404).json({ message: "Curso no encontrado" });
      return;
    }
    await course.update(req.body);
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const deleteCourse = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const course = await Course.findByPk(String(req.params.id));
    if (!course) {
      res.status(404).json({ message: "Curso no encontrado" });
      return;
    }
    await course.destroy();
    res.json({ message: "Curso eliminado" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};
