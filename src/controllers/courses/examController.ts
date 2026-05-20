import { Request, Response } from "express";
import { AuthRequest } from "../../types";
import Exam from "../../models/courses/Exam";
import Section from "../../models/courses/Section";
import ExamQuestion from "../../models/courses/ExamQuestion";
import ExamAnswer from "../../models/courses/ExamAnswer";
import { ExamUserAnswer } from "../../models";

export const getExams = async (req: Request, res: Response): Promise<void> => {
  try {
    const where: Record<string, unknown> = {};
    if (req.query.section_id) where.section_id = req.query.section_id;

    const exams = await Exam.findAll({
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
    const exam = await Exam.findByPk(String(req.params.id), {
      include: [
        {
          model: ExamQuestion,
          as: "questions",
          separate: true,
          order: [["sort_order", "ASC"]],
          include: [
            {
              model: ExamAnswer,
              as: "answers",
            },
          ],
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
    const { type, section_id, passing_score, counts_for_grade } = req.body;
    const activity = await Section.findByPk(section_id);
    if (!activity) {
      res.status(404).json({ message: "Actividad no encontrada" });
      return;
    }
    const existingExam = await Exam.findOne({
      where: { section_id },
    });

    if (existingExam) {
      res.status(400).json({
        message: "La sección ya tiene un examen",
      });
      return;
    }
    const exam = await Exam.create({
      type,
      section_id,
      passing_score,
      counts_for_grade,
    });
    res.status(201).json(exam);
  } catch (err) {
    console.error(err);

    res.status(500).json({ message: "Error", error: err });
  }
};

export const updateExam = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const exam = await Exam.findByPk(String(req.params.id));
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
    const exam = await Exam.findByPk(String(req.params.id));
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

export const getExamResult = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const examId = Number(req.params.id);

    const exam = await Exam.findByPk(examId);

    if (!exam) {
      res.status(404).json({
        message: "Examen no encontrado",
      });
      return;
    }

    const questions = await ExamQuestion.findAll({
      where: {
        exam_id: examId,
      },
      attributes: ["id", "type"],
    });

    if (questions.length === 0) {
      res.status(400).json({
        message: "El examen no tiene preguntas",
      });
      return;
    }

    const questionIds = questions.map((q) => q.id);

    const userAnswers = await ExamUserAnswer.findAll({
      where: {
        user_id: req.user!.id,
        question_id: questionIds,
      },
    });

    const answersMap = new Map(userAnswers.map((a) => [a.question_id, a]));

    let correctCount = 0;
    let hasPendingOpenQuestions = false;

    for (const question of questions) {
      const answer = answersMap.get(question.id);

      if (!answer) continue;

      // Preguntas abiertas
      if (question.type === "open") {
        if (answer.status === "approved") {
          correctCount++;
        }

        if (answer.status === "pending") {
          hasPendingOpenQuestions = true;
        }
      }

      // Opción múltiple
      if (question.type === "multiple_choice") {
        if (answer.is_correct) {
          correctCount++;
        }
      }
    }

    const totalQuestions = questions.length;

    const score = (correctCount / totalQuestions) * 100;

    const passed = score >= exam.passing_score;
    
    if (hasPendingOpenQuestions) {
      res.json({
        pending_review: true,
        passed: false,
        score: Number(score.toFixed(2)),
        passing_score: exam.passing_score,
        correct_answers: correctCount,
        total_questions: totalQuestions,
        counts_for_grade: exam.counts_for_grade,
        exam_type: exam.type,
      });

      return;
    }

    res.json({
      passed,
      score: Number(score.toFixed(2)),
      passing_score: exam.passing_score,
      correct_answers: correctCount,
      total_questions: totalQuestions,
      counts_for_grade: exam.counts_for_grade,
      exam_type: exam.type,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Error",
      error: err,
    });
  }
};
