import { Request, Response } from "express";
import { AuthRequest } from "../../types";
import CourseModuleSectionQuestionUserAnswer from "../../models/courses/CourseModuleSectionQuestionUserAnswer";
import CourseModuleSectionQuestion from "../../models/courses/CourseModuleSectionQuestion";
import CourseModuleSectionAnswer from "../../models/courses/CourseModuleSectionAnswer";
import { User } from "../../models";

export const getUserAnswers = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const where: Record<string, unknown> = {};
    if (req.query.question_id) where.question_id = req.query.question_id;
    if (req.query.status) where.status = req.query.status;

    if (req.user?.role === "user") where.user_id = req.user.id;

    const userAnswers = await CourseModuleSectionQuestionUserAnswer.findAll({
      where,
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
        { model: CourseModuleSectionQuestion, as: "question" },
        { model: CourseModuleSectionAnswer, as: "answer_option" },
      ],
      order: [["id", "DESC"]],
    });
    res.json(userAnswers);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getUserAnswerById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userAnswer = await CourseModuleSectionQuestionUserAnswer.findByPk(
      String(req.params.id),
      {
        include: [
          { model: User, as: "user", attributes: ["id", "name", "email"] },
          { model: CourseModuleSectionQuestion, as: "question" },
          { model: CourseModuleSectionAnswer, as: "answer_option" },
        ],
      },
    );
    if (!userAnswer) {
      res.status(404).json({ message: "Respuesta no encontrada" });
      return;
    }
    res.json(userAnswer);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const submitUserAnswer = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { question_id, answer_text, answer_option_id } = req.body;
    const question = await CourseModuleSectionQuestion.findByPk(question_id);
    if (!question) {
      res.status(404).json({ message: "Pregunta no encontrada" });
      return;
    }

    let status: "pending" | "auto_approved" = "pending";

    if (question.type === "multiple_choice" && answer_option_id) {
      const correctAnswer = await CourseModuleSectionAnswer.findOne({
        where: {
          id: answer_option_id,
          course_module_section_question_id: question_id,
        },
      });
      status = correctAnswer?.is_correct ? "auto_approved" : "pending";
    }

    const created = await CourseModuleSectionQuestionUserAnswer.create({
      user_id: req.user!.id,
      question_id,
      answer_text,
      answer_option_id,
      status,
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const reviewUserAnswer = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { status } = req.body;
    const userAnswer = await CourseModuleSectionQuestionUserAnswer.findByPk(
      String(req.params.id),
    );
    if (!userAnswer) {
      res.status(404).json({ message: "Respuesta no encontrada" });
      return;
    }
    await userAnswer.update({ status });
    res.json(userAnswer);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const deleteUserAnswer = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userAnswer = await CourseModuleSectionQuestionUserAnswer.findByPk(
      String(req.params.id),
    );
    if (!userAnswer) {
      res.status(404).json({ message: "Respuesta no encontrada" });
      return;
    }
    await userAnswer.destroy();
    res.json({ message: "Respuesta eliminada" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};
