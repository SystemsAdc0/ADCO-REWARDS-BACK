import { Request, Response } from "express";
import { AuthRequest } from "../../types";
import CourseModuleSectionQuestion from "../../models/courses/CourseModuleSectionQuestion";
import CourseModuleSectionExam from "../../models/courses/CourseModuleSectionExam";
import CourseModuleSectionAnswer from "../../models/courses/CourseModuleSectionAnswer";

export const getQuestions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const where: Record<string, unknown> = {};
    if (req.query.course_module_section_exam_id)
      where.course_module_section_exam_id =
        req.query.course_module_section_exam_id;

    const questions = await CourseModuleSectionQuestion.findAll({
      where,
      include: [{ model: CourseModuleSectionAnswer, as: "answers" }],
      order: [["id", "ASC"]],
    });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getQuestionById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const question = await CourseModuleSectionQuestion.findByPk(
      String(req.params.id),
      {
        include: [{ model: CourseModuleSectionAnswer, as: "answers" }],
      },
    );
    if (!question) {
      res.status(404).json({ message: "Pregunta no encontrada" });
      return;
    }
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const createQuestion = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { question, type, course_module_section_exam_id } = req.body;
    const exam = await CourseModuleSectionExam.findByPk(
      course_module_section_exam_id,
    );
    if (!exam) {
      res.status(404).json({ message: "Examen no encontrado" });
      return;
    }
    const created = await CourseModuleSectionQuestion.create({
      question: question.trim(),
      type,
      course_module_section_exam_id,
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const updateQuestion = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const question = await CourseModuleSectionQuestion.findByPk(
      String(req.params.id),
    );
    if (!question) {
      res.status(404).json({ message: "Pregunta no encontrada" });
      return;
    }
    await question.update(req.body);
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const deleteQuestion = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const question = await CourseModuleSectionQuestion.findByPk(
      String(req.params.id),
    );
    if (!question) {
      res.status(404).json({ message: "Pregunta no encontrada" });
      return;
    }
    await question.destroy();
    res.json({ message: "Pregunta eliminada" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};
