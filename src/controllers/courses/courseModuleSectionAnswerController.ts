import { Request, Response } from "express";
import { AuthRequest } from "../../types";
import CourseModuleSectionAnswer from "../../models/courses/CourseModuleSectionAnswer";
import CourseModuleSectionQuestion from "../../models/courses/CourseModuleSectionQuestion";

export const getAnswers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const where: Record<string, unknown> = {};
    if (req.query.course_module_section_question_id)
      where.course_module_section_question_id =
        req.query.course_module_section_question_id;

    const answers = await CourseModuleSectionAnswer.findAll({
      where,
      order: [["id", "ASC"]],
    });
    res.json(answers);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getAnswerById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const answer = await CourseModuleSectionAnswer.findByPk(
      String(req.params.id),
    );
    if (!answer) {
      res.status(404).json({ message: "Respuesta no encontrada" });
      return;
    }
    res.json(answer);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const createAnswer = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { answer, is_correct, course_module_section_question_id } = req.body;
    const question = await CourseModuleSectionQuestion.findByPk(
      course_module_section_question_id,
    );
    if (!question) {
      res.status(404).json({ message: "Pregunta no encontrada" });
      return;
    }
    const created = await CourseModuleSectionAnswer.create({
      answer: answer.trim(),
      is_correct: is_correct ?? false,
      course_module_section_question_id,
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const updateAnswer = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const answer = await CourseModuleSectionAnswer.findByPk(
      String(req.params.id),
    );
    if (!answer) {
      res.status(404).json({ message: "Respuesta no encontrada" });
      return;
    }
    await answer.update(req.body);
    res.json(answer);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const deleteAnswer = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const answer = await CourseModuleSectionAnswer.findByPk(
      String(req.params.id),
    );
    if (!answer) {
      res.status(404).json({ message: "Respuesta no encontrada" });
      return;
    }
    await answer.destroy();
    res.json({ message: "Respuesta eliminada" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};
