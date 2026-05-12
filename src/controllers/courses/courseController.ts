import { Request, Response } from "express";
import { AuthRequest } from "../../types";
import Course from "../../models/courses/Course";
import Department from "../../models/courses/Department";
import CourseModule from "../../models/courses/CourseModule";
import CourseModuleSection from "../../models/courses/CourseModuleSection";
import CourseModuleSectionLink from "../../models/courses/CourseModuleSectionLink";
import CourseModuleSectionActivity from "../../models/courses/CourseModuleSectionActivity";
import CourseModuleSectionExam from "../../models/courses/CourseModuleSectionExam";
import CourseModuleSectionQuestion from "../../models/courses/CourseModuleSectionQuestion";
import CourseModuleSectionAnswer from "../../models/courses/CourseModuleSectionAnswer";
import User from "../../models/User";
import UserCourseAssignment from "../../models/courses/UserCourseAssignment";
import { Op } from "sequelize";

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

export const getMyCourses = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const dbUser = await User.findByPk(req.user!.id, {
      attributes: ["id", "department_id"],
    });
    if (!dbUser) {
      res.json([]);
      return;
    }

    // Gather manually assigned course IDs
    const manualAssignments = await UserCourseAssignment.findAll({
      where: { user_id: dbUser.id },
      attributes: ["course_id"],
    });
    const manualIds = manualAssignments.map((a) => a.course_id);

    // Build OR condition: department courses + manually assigned courses
    const orConditions: Record<string, unknown>[] = [];
    if (dbUser.department_id) orConditions.push({ department_id: dbUser.department_id });
    if (manualIds.length > 0) orConditions.push({ id: manualIds });

    if (orConditions.length === 0) {
      res.json([]);
      return;
    }

    const whereClause =
      orConditions.length === 1 ? orConditions[0] : { [Op.or]: orConditions };

    const courses = await Course.findAll({
      where: whereClause,
      include: [
        { model: Department, as: "department", attributes: ["id", "name"] },
        {
          model: CourseModule,
          as: "modules",
          attributes: ["id", "name", "course_id"],
          order: [["id", "ASC"]],
          separate: true,
          include: [
            {
              model: CourseModuleSection,
              as: "sections",
              attributes: ["id", "name", "type", "course_module_id"],
              order: [["id", "ASC"]],
              separate: true,
            },
          ],
        },
      ],
      order: [["id", "ASC"]],
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

export const getCourseFullContent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const course = await Course.findByPk(String(req.params.id), {
      include: [
        { model: Department, as: "department", attributes: ["id", "name"] },
        {
          model: CourseModule,
          as: "modules",
          include: [
            {
              model: CourseModuleSection,
              as: "sections",
              include: [
                { model: CourseModuleSectionLink, as: "links" },
                {
                  model: CourseModuleSectionActivity,
                  as: "activities",
                  include: [
                    {
                      model: CourseModuleSectionExam,
                      as: "exam",
                      include: [
                        {
                          model: CourseModuleSectionQuestion,
                          as: "questions",
                          include: [
                            {
                              model: CourseModuleSectionAnswer,
                              as: "answers",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
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
