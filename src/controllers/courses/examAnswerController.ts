import { Request, Response } from "express";
import { AuthRequest } from "../../types";
import ExamAnswer from "../../models/courses/ExamAnswer";
import ExamQuestion from "../../models/courses/ExamQuestion";
import { Op } from "sequelize";

export const getAnswers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const where: Record<string, unknown> = {};
    if (req.query.question_id) where.question_id = req.query.question_id;

    const answers = await ExamAnswer.findAll({
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
    const answer = await ExamAnswer.findByPk(String(req.params.id));
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
    const { answer, is_correct, question_id } = req.body;
    const question = await ExamQuestion.findByPk(question_id);
    if (!question) {
      res.status(404).json({ message: "Pregunta no encontrada" });
      return;
    }
    if (question.type === "open") {
      res.status(400).json({
        message:
          "Las preguntas abiertas no pueden tener respuestas predefinidas",
      });
      return;
    }
    // Máximo 4 respuestas por pregunta
    const answersCount = await ExamAnswer.count({
      where: {
        question_id,
      },
    });

    if (answersCount >= 4) {
      res.status(400).json({
        message: "Solo se permiten máximo 4 respuestas por pregunta",
      });
      return;
    }
    
    if (is_correct) {
      const correctAnswersCount = await ExamAnswer.count({
        where: {
          question_id,
          is_correct: true,
        },
      });

      if (correctAnswersCount > 0) {
        res.status(400).json({
          message: "La pregunta ya tiene una respuesta correcta",
        });
        return;
      }
    }
    const created = await ExamAnswer.create({
      answer: answer.trim(),
      is_correct: is_correct ?? false,
      question_id,
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
    const answer = await ExamAnswer.findByPk(String(req.params.id));
    if (!answer) {
      res.status(404).json({ message: "Respuesta no encontrada" });
      return;
    }
    if (req.body.is_correct === true) {
      const correctAnswer = await ExamAnswer.findOne({
        where: {
          question_id: answer.question_id,
          is_correct: true,
          id: {
            [Op.ne]: answer.id,
          },
        },
      });

      if (correctAnswer) {
        res.status(400).json({
          message: "La pregunta ya tiene una respuesta correcta",
        });
        return;
      }
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
    const answer = await ExamAnswer.findByPk(String(req.params.id));
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
