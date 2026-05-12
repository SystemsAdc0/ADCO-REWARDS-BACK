import { Response } from "express";
import { AuthRequest } from "../../types";
import UserCourseProgress from "../../models/courses/UserCourseProgress";
import CourseModuleSection from "../../models/courses/CourseModuleSection";
import CourseModule from "../../models/courses/CourseModule";

export const getUserProgress = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user!.id;
    const { course_id } = req.query;

    if (!course_id) {
      res.status(400).json({ message: "course_id requerido" });
      return;
    }

    const progress = await UserCourseProgress.findAll({
      where: { user_id },
      include: [
        {
          model: CourseModuleSection,
          as: "section",
          required: true,
          attributes: ["id", "name", "type", "course_module_id"],
          include: [
            {
              model: CourseModule,
              as: "module",
              required: true,
              where: { course_id: Number(course_id) },
              attributes: ["id", "name", "course_id"],
            },
          ],
        },
      ],
    });

    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const markSectionComplete = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user!.id;
    const { section_id } = req.body;

    if (!section_id) {
      res.status(400).json({ message: "section_id requerido" });
      return;
    }

    const [progress] = await UserCourseProgress.findOrCreate({
      where: { user_id, course_module_section_id: section_id },
      defaults: {
        user_id,
        course_module_section_id: section_id,
        completed_at: new Date(),
      },
    });

    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};
