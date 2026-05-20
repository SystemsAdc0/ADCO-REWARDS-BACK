import { Response } from "express";
import { AuthRequest } from "../../types";
import UserCourseProgress from "../../models/courses/UserCourseProgress";
import Section from "../../models/courses/Section";
import Module from "../../models/courses/Module";
import {
  Course,
  Exam,
  ExamQuestion,
  ExamUserAnswer,
  SectionEvidence,
  User,
  UserCourseAssignment,
} from "../../models";

type ExamUserAnswerWithRelations = ExamUserAnswer & {
  user: User;
  question: ExamQuestion & {
    exam: Exam & {
      section: Section & {
        module: Module & {
          course: Course;
        };
      };
    };
  };
};

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
          model: Section,
          as: "section",
          required: true,
          attributes: ["id", "name", "type", "module_id"],
          include: [
            {
              model: Module,
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
      where: { user_id, section_id: section_id },
      defaults: {
        user_id,
        section_id: section_id,
        completed_at: new Date(),
      },
    });

    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getCourseUserProgress = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { course_id } = req.query;

    if (!course_id) {
      res.status(400).json({
        message: "course_id requerido",
      });

      return;
    }

    // Todas las secciones del curso
    const sections = await Section.findAll({
      include: [
        {
          model: Module,
          as: "module",
          required: true,
          where: {
            course_id: Number(course_id),
          },
          attributes: ["id"],
        },
      ],
      attributes: ["id", "name", "type"],
    });

    const totalSections = sections.length;

    const sectionIds = sections.map((s) => s.id);

    // Usuarios inscritos
    const assignments = await UserCourseAssignment.findAll({
      where: {
        course_id: Number(course_id),
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    const users = assignments
      .map((a) => (a as UserCourseAssignment & { user: User }).user)
      .filter(Boolean);

    const result = await Promise.all(
      users.map(async (user) => {
        // progreso completado
        const completedSections = await UserCourseProgress.count({
          where: {
            user_id: user.id,
            section_id: sectionIds,
          },
        });

        const progress =
          totalSections > 0
            ? Math.round((completedSections / totalSections) * 100)
            : 0;

        // pendientes de revisar
        const pendingReviews = await ExamUserAnswer.count({
          where: {
            user_id: user.id,
            status: "pending",
          },
          include: [
            {
              model: ExamQuestion,
              as: "question",
              required: true,
            },
          ],
        });

        // exámenes
        const exams = await Exam.findAll({
          include: [
            {
              model: Section,
              as: "section",
              required: true,
              where: {
                id: sectionIds,
              },
            },
          ],
        });

        const examResults = await Promise.all(
          exams.map(async (exam) => {
            const questions = await ExamQuestion.findAll({
              where: {
                exam_id: exam.id,
              },
            });

            const questionIds = questions.map((q) => q.id);

            const answers = await ExamUserAnswer.findAll({
              where: {
                user_id: user.id,
                question_id: questionIds,
              },
            });

            let correctCount = 0;

            for (const answer of answers) {
              if (
                answer.status === "approved" ||
                answer.status === "auto_approved"
              ) {
                correctCount++;
              }
            }

            const score =
              questions.length > 0
                ? Math.round((correctCount / questions.length) * 100)
                : 0;

            return {
              id: exam.id,
              type: exam.type,
              score,
              counts_for_grade: exam.counts_for_grade,
              passed: score >= exam.passing_score,
              pending_review: answers.some((a) => a.status === "pending"),
            };
          }),
        );

        const requiredExams = examResults.filter((e) => e.counts_for_grade);

        const allRequiredExamsPassed = requiredExams.every((e) => e.passed);

        let status = "not_started";

        if (progress > 0) {
          status = "in_progress";
        }

        if (completedSections === totalSections && allRequiredExamsPassed) {
          status = "completed";
        }

        if (pendingReviews > 0) {
          status = "pending_review";
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          status,
          progress,
          completed_sections: completedSections,
          total_sections: totalSections,
          pending_reviews: pendingReviews,
          exams: examResults,
        };
      }),
    );

    res.json(result);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Error",
      error: err,
    });
  }
};

export const getPendingEntries = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    // if (!req.user?.department_id) {
    //   res.status(400).json({
    //     message: "Falta el id del departamento",
    //   });

    //   return;
    // }

    console.log("llega --------------");

    // const { department_id } = req.user

    const pendingOpenQuestions = await ExamUserAnswer.findAll({
      where: {
        status: "pending",
      },

      include: [
        {
          model: User,
          as: "user",
          required: true,
          attributes: ["id", "name", "email"],
        },

        {
          model: ExamQuestion,
          as: "question",
          required: true,
          where: {
            type: "open",
          },
          include: [
            {
              model: Exam,
              as: "exam",
              required: true,
              include: [
                {
                  model: Section,
                  as: "section",
                  required: true,
                  include: [
                    {
                      model: Module,
                      as: "module",
                      required: true,
                      include: [
                        {
                          model: Course,
                          as: "course",
                          required: true,

                          where: {
                            department_id: 1,
                          },
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

    const groupedOpenQuestions = Object.values(
      (pendingOpenQuestions as ExamUserAnswerWithRelations[]).reduce(
        (acc, answer) => {
          const question = answer.question;

          const exam = question.exam;
          const section = exam.section;
          const module = section.module;
          const course = module.course;

          // usuario + sección
          const key = `${answer.user_id}-${section.id}`;

          if (!acc[key]) {
            acc[key] = {
              type: "open_questions",
              user: answer.user,
              course: {
                id: course.id,
                name: course.name,
              },
              module: {
                id: module.id,
                name: module.name,
              },
              section: {
                id: section.id,
                name: section.name,
              },
              exam: {
                id: exam.id,
              },
              pending_count: 0,
              latest_answer_at: answer.created_at,
            };
          }

          acc[key].pending_count += 1;

          if (
            answer.created_at &&
            new Date(answer.created_at) > new Date(acc[key].latest_answer_at)
          ) {
            acc[key].latest_answer_at = answer.created_at;
          }

          return acc;
        },

        {} as Record<string, any>,
      ),
    );

    const pendingEvidence = await SectionEvidence.findAll({
      where: {
        status: "pending",
      },

      include: [
        {
          model: User,
          as: "user",
          required: true,
          attributes: ["id", "name", "email"],
        },
        {
          model: Section,
          as: "section",
          required: true,
          include: [
            {
              model: Module,
              as: "module",
              required: true,

              include: [
                {
                  model: Course,
                  as: "course",
                  required: true,

                  where: {
                    department_id: 1,
                  },
                },
              ],
            },
          ],
        },
      ],
    });

    const groupedEvidence = Object.values(
      (
        pendingEvidence as (SectionEvidence & {
          user: User;
          section: Section & {
            module: Module & {
              course: Course;
            };
          };
        })[]
      ).reduce(
        (acc, evidence) => {
          const section = evidence.section;
          const module = section.module;
          const course = module.course;

          const key = `${evidence.user_id}-${section.id}`;

          if (!acc[key]) {
            acc[key] = {
              type: "evidence",
              user: evidence.user,
              course: {
                id: course.id,
                name: course.name,
              },
              module: {
                id: module.id,
                name: module.name,
              },
              section: {
                id: section.id,
                name: section.name,
              },
              pending_count: 0,
              latest_evidence_at: evidence.created_at,
            };
          }

          acc[key].pending_count += 1;

          if (
            evidence.created_at &&
            new Date(evidence.created_at) >
              new Date(acc[key].latest_evidence_at)
          ) {
            acc[key].latest_evidence_at = evidence.created_at;
          }

          return acc;
        },

        {} as Record<string, any>,
      ),
    );

    const result = [...groupedOpenQuestions, ...groupedEvidence].sort(
      (a, b) =>
        new Date(b.latest_answer_at || b.latest_evidence_at).getTime() -
        new Date(a.latest_answer_at || a.latest_evidence_at).getTime(),
    );

    res.json(result);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Error",
      error: err,
    });
  }
};

export const getPendingReviewDetail = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { user_id, section_id } = req.query;

    if (!user_id || !section_id) {
      res.status(400).json({
        message: "user_id y section_id son requeridos",
      });

      return;
    }

    const section = await Section.findByPk(Number(section_id), {
      include: [
        {
          model: Module,
          as: "module",
          required: true,
          include: [
            {
              model: Course,
              as: "course",
              required: true,
            },
          ],
        },
      ],
    });

    if (!section) {
      res.status(404).json({
        message: "Sección no encontrada",
      });

      return;
    }

    const user = await User.findByPk(Number(user_id), {
      attributes: ["id", "name", "email"],
    });

    if (!user) {
      res.status(404).json({
        message: "Usuario no encontrado",
      });

      return;
    }

    const module = (
      section as Section & {
        module: Module & {
          course: Course;
        };
      }
    ).module;

    const course = module.course;

    const exam = await Exam.findOne({
      where: {
        section_id: section.id,
      },
      include: [
        {
          model: ExamQuestion,
          as: "questions",
          required: false,
          where: {
            type: "open",
          },
          include: [
            {
              model: ExamUserAnswer,
              as: "userAnswers",
              required: false,
              where: {
                user_id: user.id,
                status: "pending",
              },
            },
          ],
        },
      ],
    });

    const formattedExam = exam
      ? {
          id: exam.id,
          questions: (
            exam as Exam & {
              questions: (ExamQuestion & {
                userAnswers?: ExamUserAnswer[];
              })[];
            }
          ).questions
            .filter((q) => (q.userAnswers ?? []).length > 0)
            .map((q) => ({
              id: q.id,
              question: q.question,
              type: q.type,
              answer: q.userAnswers?.[0]
                ? {
                    id: q.userAnswers[0].id,
                    answer_text: q.userAnswers[0].answer_text,
                    status: q.userAnswers[0].status,
                    created_at: q.userAnswers[0].created_at,
                  }
                : null,
            })),
        }
      : null;

    const evidence = await SectionEvidence.findAll({
      where: {
        user_id: user.id,
        section_id: section.id,
        status: "pending",
      },
      attributes: ["id", "evidence", "status", "created_at"],
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      course: {
        id: course.id,
        name: course.name,
      },
      module: {
        id: module.id,
        name: module.name,
      },
      section: {
        id: section.id,
        name: section.name,
        type: section.type,
      },
      exam: formattedExam,
      evidence,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Error",
      error: err,
    });
  }
};

export const reviewExam = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Error",
      error: err,
    });
  }
};
