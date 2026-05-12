import { Response } from "express";
import { AuthRequest } from "../../types";
import UserCourseAssignment from "../../models/courses/UserCourseAssignment";
import User from "../../models/User";
import Course from "../../models/courses/Course";

export const getAssignments = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { course_id, user_id } = req.query;
    const where: Record<string, unknown> = {};
    if (course_id) where.course_id = Number(course_id);
    if (user_id) where.user_id = Number(user_id);

    const assignments = await UserCourseAssignment.findAll({
      where,
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email", "avatar", "department_id"] },
        { model: Course, as: "course", attributes: ["id", "name"] },
      ],
      order: [["id", "DESC"]],
    });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const assignCourse = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { user_id, course_id } = req.body;
    if (!user_id || !course_id) {
      res.status(400).json({ message: "user_id y course_id requeridos" });
      return;
    }

    const [assignment, created] = await UserCourseAssignment.findOrCreate({
      where: { user_id, course_id },
      defaults: { user_id, course_id },
    });

    if (!created) {
      res.status(409).json({ message: "Ya está asignado" });
      return;
    }

    const full = await UserCourseAssignment.findByPk(assignment.id, {
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email", "avatar"] },
        { model: Course, as: "course", attributes: ["id", "name"] },
      ],
    });
    res.status(201).json(full);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const removeAssignment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const assignment = await UserCourseAssignment.findByPk(
      String(req.params.id),
    );
    if (!assignment) {
      res.status(404).json({ message: "Asignación no encontrada" });
      return;
    }
    await assignment.destroy();
    res.json({ message: "Asignación eliminada" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};
