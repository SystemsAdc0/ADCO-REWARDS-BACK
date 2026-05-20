import { Request, Response } from "express";
import { AuthRequest } from "../../types";

import ExamUserAnswer, { ExamUserAnswerStatus } from "../../models/courses/ExamUserAnswer";
import ExamQuestion from "../../models/courses/ExamQuestion";
import ExamAnswer from "../../models/courses/ExamAnswer";

import { User } from "../../models";

export const getUserAnswers = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const where: Record<string, unknown> = {};

    if (req.query.question_id) {
      where.question_id = req.query.question_id;
    }

    if (req.query.status) {
      where.status = req.query.status;
    }

    if (req.user?.role === "user") {
      where.user_id = req.user.id;
    }

    if (req.query.exam_id) {
      const questions = await ExamQuestion.findAll({
        where: {
          exam_id: Number(req.query.exam_id),
        },
        attributes: ["id"],
      });

      where.question_id = questions.map((q) => q.id);
    }

    const userAnswers = await ExamUserAnswer.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
        {
          model: ExamQuestion,
          as: "question",
        },
        {
          model: ExamAnswer,
          as: "answer_option",
        },
      ],
      order: [["id", "DESC"]],
    });

    res.json(userAnswers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getUserAnswerById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userAnswer = await ExamUserAnswer.findByPk(String(req.params.id), {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
        {
          model: ExamQuestion,
          as: "question",
        },
        {
          model: ExamAnswer,
          as: "answer_option",
        },
      ],
    });

    if (!userAnswer) {
      res.status(404).json({ message: "Respuesta no encontrada" });
      return;
    }

    res.json(userAnswer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error", error: err });
  }
};

export const submitUserAnswer = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { question_id, answer_text, answer_option_id } = req.body;

    const question = await ExamQuestion.findByPk(question_id);

    if (!question) {
      res.status(404).json({ message: "Pregunta no encontrada" });
      return;
    }

    let status: ExamUserAnswerStatus =
      "pending";

    let is_correct = false;

    // Preguntas abiertas
    if (question.type === "open") {
      status = "pending";
    }

    // Preguntas de opción múltiple
    if (question.type === "multiple_choice") {
      if (!answer_option_id) {
        res.status(400).json({
          message: "Debes enviar una opción de respuesta",
        });
        return;
      }

      const selectedAnswer = await ExamAnswer.findOne({
        where: {
          id: answer_option_id,
          question_id,
        },
      });

      if (!selectedAnswer) {
        res.status(404).json({
          message: "Respuesta no válida",
        });
        return;
      }

      is_correct = Boolean(selectedAnswer.is_correct);

      status = is_correct ? "auto_approved" : "rejected";
    }

    const [record, created] = await ExamUserAnswer.findOrCreate({
      where: {
        user_id: req.user!.id,
        question_id,
      },
      defaults: {
        user_id: req.user!.id,
        question_id,
        answer_text,
        answer_option_id,
        status,
        is_correct,
      },
    });

    if (!created) {
      await record.update({
        answer_text,
        answer_option_id,
        status,
        is_correct,
      });
    }

    res.status(created ? 201 : 200).json(record);
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

    const userAnswer = await ExamUserAnswer.findByPk(String(req.params.id));

    if (!userAnswer) {
      res.status(404).json({
        message: "Respuesta no encontrada",
      });
      return;
    }

    await userAnswer.update({
      status,
      is_correct: status === "approved",
    });

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
    const userAnswer = await ExamUserAnswer.findByPk(String(req.params.id));

    if (!userAnswer) {
      res.status(404).json({
        message: "Respuesta no encontrada",
      });
      return;
    }

    await userAnswer.destroy();

    res.json({
      message: "Respuesta eliminada",
    });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};
