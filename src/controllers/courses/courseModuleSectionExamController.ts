import { Request, Response } from "express";
import { AuthRequest } from "../../types";
import CourseModuleSectionExam from "../../models/courses/CourseModuleSectionExam";
import CourseModuleSectionActivity from "../../models/courses/CourseModuleSectionActivity";
import CourseModuleSectionQuestion from "../../models/courses/CourseModuleSectionQuestion";
import CourseModuleSectionAnswer from "../../models/courses/CourseModuleSectionAnswer";

export const getExams = async (req: Request, res: Response): Promise<void> => {
  try {
    const where: Record<string, unknown> = {};
    if (req.query.course_module_section_activity_id)
      where.course_module_section_activity_id =
        req.query.course_module_section_activity_id;

    const exams = await CourseModuleSectionExam.findAll({
      where,
      order: [["id", "ASC"]],
    });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getExamById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const exam = await CourseModuleSectionExam.findByPk(String(req.params.id), {
      include: [
        {
          model: CourseModuleSectionQuestion,
          as: "questions",
          include: [{ model: CourseModuleSectionAnswer, as: "answers" }],
        },
      ],
    });
    if (!exam) {
      res.status(404).json({ message: "Examen no encontrado" });
      return;
    }
    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const createExam = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, type, passing_score, course_module_section_activity_id } =
      req.body;
    const activity = await CourseModuleSectionActivity.findByPk(
      course_module_section_activity_id,
    );
    if (!activity) {
      res.status(404).json({ message: "Actividad no encontrada" });
      return;
    }
    const exam = await CourseModuleSectionExam.create({
      name: name.trim(),
      type,
      passing_score,
      course_module_section_activity_id,
    });
    res.status(201).json(exam);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const updateExam = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const exam = await CourseModuleSectionExam.findByPk(String(req.params.id));
    if (!exam) {
      res.status(404).json({ message: "Examen no encontrado" });
      return;
    }
    await exam.update(req.body);
    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const deleteExam = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const exam = await CourseModuleSectionExam.findByPk(String(req.params.id));
    if (!exam) {
      res.status(404).json({ message: "Examen no encontrado" });
      return;
    }
    await exam.destroy();
    res.json({ message: "Examen eliminado" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};
