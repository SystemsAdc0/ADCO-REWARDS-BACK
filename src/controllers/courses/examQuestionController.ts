import { Request, Response } from "express";
import { AuthRequest } from "../../types";

import ExamQuestion from "../../models/courses/ExamQuestion";
import Exam from "../../models/courses/Exam";
import ExamAnswer from "../../models/courses/ExamAnswer";
import sequelize from "../../config/database";

export const getQuestions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const where: Record<string, unknown> = {};

    if (req.query.exam_id) {
      where.exam_id = req.query.exam_id;
    }

    const questions = await ExamQuestion.findAll({
      where,
      include: [
        {
          model: ExamAnswer,
          as: "answers",
        },
      ],
      order: [["sort_order", "ASC"]],
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
    const question = await ExamQuestion.findByPk(String(req.params.id), {
      include: [
        {
          model: ExamAnswer,
          as: "answers",
        },
      ],
    });

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
    const { question, type, exam_id, sort_order } = req.body;

    const exam = await Exam.findByPk(exam_id);

    if (!exam) {
      res.status(404).json({ message: "Examen no encontrado" });
      return;
    }

    const created = await ExamQuestion.create({
      question: question.trim(),
      type,
      exam_id,
      sort_order,
    });

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const createFullQuestion = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const { question, type, exam_id, answers = [] } = req.body;

    const lastQuestion = await ExamQuestion.findOne({
      where: { exam_id },
      order: [["sort_order", "DESC"]],
    });
    const sort_order = lastQuestion ? lastQuestion.sort_order + 1 : 1;

    const createdQuestion = await ExamQuestion.create(
      {
        question: question.trim(),
        type,
        exam_id,
        sort_order,
      },
      { transaction },
    );

    if (type === "multiple_choice") {
      if (!Array.isArray(answers) || answers.length === 0) {
        await transaction.rollback();

        res.status(400).json({
          message: "La pregunta debe tener respuestas",
        });

        return;
      }

      if (answers.length > 4) {
        await transaction.rollback();

        res.status(400).json({
          message: "Máximo 4 respuestas",
        });

        return;
      }

      const correctAnswers = answers.filter((a) => a.is_correct);

      if (correctAnswers.length !== 1) {
        await transaction.rollback();

        res.status(400).json({
          message: "Debe existir exactamente una respuesta correcta",
        });

        return;
      }

      await ExamAnswer.bulkCreate(
        answers.map((a: any) => ({
          answer: a.answer.trim(),
          is_correct: a.is_correct,
          question_id: createdQuestion.id,
        })),
        { transaction },
      );
    }

    await transaction.commit();

    res.status(201).json(createdQuestion);
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    res.status(500).json({
      message: "Error",
      error: err,
    });
  }
};

export const updateQuestion = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const question = await ExamQuestion.findByPk(String(req.params.id));

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

export const updateFullQuestion = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const question = await ExamQuestion.findByPk(String(req.params.id));

    if (!question) {
      await transaction.rollback();

      res.status(404).json({
        message: "Pregunta no encontrada",
      });

      return;
    }

    const { question: questionText, type, answers = [] } = req.body;

    await question.update(
      {
        question: questionText.trim(),
        type,
      },
      { transaction },
    );

    await ExamAnswer.destroy({
      where: {
        question_id: question.id,
      },
      transaction,
    });

    if (type === "multiple_choice") {
      if (!Array.isArray(answers) || answers.length === 0) {
        await transaction.rollback();

        res.status(400).json({
          message: "La pregunta debe tener respuestas",
        });

        return;
      }

      if (answers.length > 4) {
        await transaction.rollback();

        res.status(400).json({
          message: "Máximo 4 respuestas",
        });

        return;
      }

      const correctAnswers = answers.filter((a) => a.is_correct);

      if (correctAnswers.length !== 1) {
        await transaction.rollback();

        res.status(400).json({
          message: "Debe existir exactamente una respuesta correcta",
        });

        return;
      }

      await ExamAnswer.bulkCreate(
        answers.map((a: any) => ({
          answer: a.answer.trim(),
          is_correct: a.is_correct,
          question_id: question.id,
        })),
        { transaction },
      );
    }

    await transaction.commit();

    res.json(question);
  } catch (err) {
    await transaction.rollback();

    console.error(err);

    res.status(500).json({
      message: "Error",
      error: err,
    });
  }
};

export const reorderQuestions = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { questions } = req.body;

    if (!Array.isArray(questions)) {
      res.status(400).json({
        message: "Formato inválido",
      });
      return;
    }

    for (const item of questions) {
      if (typeof item.id !== "number" || typeof item.sort_order !== "number") {
        res.status(400).json({
          message: "Datos inválidos",
        });
        return;
      }
    }

    await Promise.all(
      questions.map((questions) =>
        ExamQuestion.update(
          {
            sort_order: questions.sort_order,
          },
          {
            where: {
              id: questions.id,
            },
          },
        ),
      ),
    );

    res.json({
      message: "Orden actualizado correctamente",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Error",
      error: err,
    });
  }
};

export const deleteQuestion = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const question = await ExamQuestion.findByPk(String(req.params.id));

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
