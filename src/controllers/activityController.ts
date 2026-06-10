import { Request, Response } from "express";
import { AuthRequest } from "../types";
import {
  Activity,
  ActivityEntry,
  User,
  PointHistory,
  Redemption,
} from "../models";
import { createNotification } from "../services/notificationService";
import { Sequelize, Op } from "sequelize";
import SocialMedia from "../models/SocialMedia";
import { deleteActivityEntryFile } from "./googleCloudController";
import ActivityQuestion from "../models/ActivityQuestion";
import ActivityAnswer from "../models/ActivityAnswer";
import sequelize from "../config/database";

export const getActivitiesAdmin = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    if (!user?.id) {
      res.status(403).json("usuario no identificado");
      return;
    }

    // Desactivar actividades cuya end_date ya pasó, respetando el time_zone
    // registrado en cada actividad. CONVERT_TZ convierte NOW() (UTC) al
    // timezone de la actividad y lo compara con end_date (almacenado en
    // ese mismo timezone local).
    await Activity.update(
      { status: "inactive" },
      {
        where: {
          status: "active",
          [Op.and]: Sequelize.literal(
            "CONVERT_TZ(NOW(), 'UTC', time_zone) >= end_date",
          ),
        },
      },
    );

    const activities = await Activity.findAll({
      attributes: {
        include: [
          [
            Sequelize.literal(
              `EXISTS (
            SELECT 1 
            FROM activity_entries ae 
            WHERE ae.activity_id = Activity.id 
              AND ae.user_id = ${user.id} 
              AND ae.status != 'rejected'
          )`,
            ),
            "participate",
          ],
          [
            Sequelize.literal(
              `(
            SELECT ae.review_notes 
            FROM activity_entries ae 
            WHERE ae.activity_id = Activity.id 
              AND ae.user_id = ${user.id} 
              AND ae.status = 'rejected' 
            ORDER BY ae.updated_at DESC 
            LIMIT 1
          )`,
            ),
            "note",
          ],
        ],
      },
      include: [
        {
          model: SocialMedia,
          as: "social_medias",
          attributes: ["name"],
        },
        {
          model: ActivityQuestion,
          as: "questions",
          attributes: ["id", "question"],
          required: false,
          include: [
            {
              model: ActivityAnswer,
              as: "answers",
              attributes: ["id", "answer", "status"],
              where: { user_id: user.id },
              required: false,
            },
          ],
        },
      ],
      order: [["id", "DESC"]],
    });

    res.json(activities);
  } catch (err) {
    console.log(err);

    res.status(500).json({ message: "Error", error: err });
  }
};
export const getActivities = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    if (!user?.id) {
      res.status(403).json("usuario no identificado");
      return;
    }

    // Desactivar actividades cuya end_date ya pasó, respetando el time_zone
    // registrado en cada actividad. CONVERT_TZ convierte NOW() (UTC) al
    // timezone de la actividad y lo compara con end_date (almacenado en
    // ese mismo timezone local).
    await Activity.update(
      { status: "inactive" },
      {
        where: {
          status: "active",
          [Op.and]: Sequelize.literal(
            "CONVERT_TZ(NOW(), 'UTC', time_zone) >= end_date",
          ),
        },
      },
    );
    const activities = await Activity.findAll({
      attributes: {
        include: [
          [
            Sequelize.literal(`
          EXISTS (
            SELECT 1
            FROM activity_entries ae
            WHERE ae.activity_id = Activity.id
              AND ae.user_id = ${user.id}
              AND ae.status != 'rejected'
          )
        `),
            "participate",
          ],
          [
            Sequelize.literal(`
          (
            SELECT ae.review_notes
            FROM activity_entries ae
            WHERE ae.activity_id = Activity.id
              AND ae.user_id = ${user.id}
              AND ae.status = 'rejected'
            ORDER BY ae.updated_at DESC
            LIMIT 1
          )
        `),
            "note",
          ],
          [
            Sequelize.literal(`
          (
            SELECT ae.status
            FROM activity_entries ae
            WHERE ae.activity_id = Activity.id
              AND ae.user_id = ${user.id}
            ORDER BY ae.updated_at DESC
            LIMIT 1
          )
        `),
            "entry_status",
          ],
        ],
      },
      include: [
        {
          model: SocialMedia,
          as: "social_medias",
          attributes: ["name"],
        },
        {
          model: ActivityQuestion,
          as: "questions",
          attributes: ["id", "question"],
          required: false,
          include: [
            {
              model: ActivityAnswer,
              as: "answers",
              attributes: ["id", "answer", "status"],
              where: { user_id: user.id },
              required: false,
            },
          ],
        },
      ],
      order: [["id", "DESC"]],
    });

    res.json(activities);
  } catch (err) {
    console.log(err);

    res.status(500).json({ message: "Error", error: err });
  }
};

export const getActivitiesPublic = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const activities = await Activity.findAll({
      where: { status: "active" },
      order: [["start_date", "ASC"]],
    });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const createActivity = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const activity = await Activity.create(req.body);
    const { social_medias, questions } = req.body;

    for (let s of social_medias) {
      await SocialMedia.create({
        activity_id: activity.dataValues.id,
        name: s.name,
      });
    }

    for (let q of questions) {
      await ActivityQuestion.create({
        activity_id: activity.dataValues.id,
        question: q,
      });
    }
    res.status(201).json(activity);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error", error: err });
  }
};

export const updateActivity = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const t = await sequelize.transaction();
  try {
    const activity = await Activity.findByPk(String(req.params.id));

    if (!activity) {
      await t.rollback();
      res.status(404).json({ message: "Actividad no encontrada" });
      return;
    }

    const { social_medias, questions, ...activityFields } = req.body;

    await activity.update(activityFields, { transaction: t });

    if (Array.isArray(social_medias)) {
      await SocialMedia.destroy({
        where: { activity_id: activity.id },
        transaction: t,
      });
      if (social_medias.length > 0) {
        await SocialMedia.bulkCreate(
          social_medias.map((s: { name: string }) => ({
            activity_id: activity.id,
            name: s.name as "whatsapp" | "instagram" | "engage" | "platform",
          })),
          { transaction: t },
        );
      }
    }

    if (Array.isArray(questions)) {
      const existingQuestions = await ActivityQuestion.findAll({
        where: { activity_id: activity.id },
        transaction: t,
      });

      const newTexts: string[] = questions;

      const toDelete = existingQuestions.filter(
        (q) => !newTexts.includes(q.question),
      );
      const toCreate = newTexts.filter(
        (text) => !existingQuestions.some((q) => q.question === text),
      );

      if (toDelete.length > 0) {
        const deleteIds = toDelete.map((q) => q.id);
        await ActivityAnswer.destroy({
          where: { activity_question_id: deleteIds },
          transaction: t,
        });
        await ActivityQuestion.destroy({
          where: { id: deleteIds },
          transaction: t,
        });
      }

      if (toCreate.length > 0) {
        await ActivityQuestion.bulkCreate(
          toCreate.map((text) => ({
            activity_id: activity.id,
            question: text,
          })),
          { transaction: t },
        );
      }
    }

    await t.commit();

    const updated = await Activity.findByPk(activity.id, {
      include: [
        { model: SocialMedia, as: "social_medias", attributes: ["name"] },
        {
          model: ActivityQuestion,
          as: "questions",
          attributes: ["id", "question"],
        },
      ],
    });

    res.json(updated);
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: "Error", error: err });
  }
};

export const toggleActivityStatus = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const activity = await Activity.findByPk(String(req.params.id));
    if (!activity) {
      res.status(404).json({ message: "Actividad no encontrada" });
      return;
    }
    const newStatus = activity.status === "active" ? "inactive" : "active";
    await activity.update({ status: newStatus });
    res.json({
      message: `Actividad ${newStatus === "active" ? "activada" : "desactivada"}`,
      status: newStatus,
    });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const deleteActivity = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const activity = await Activity.findByPk(String(req.params.id));
    if (!activity) {
      res.status(404).json({ message: "Actividad no encontrada" });
      return;
    }
    await activity.update({ status: "inactive" });
    res.json({ message: "Actividad desactivada" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const joinActivity = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const activityId = parseInt(String(req.params.id));
    const { questions } = req.body;
    const activityExist = await ActivityEntry.findOne({
      where: {
        user_id: userId,
        activity_id: activityId,
      },
    });

    const activityQuestions = await ActivityQuestion.findAll({
      where: { activity_id: activityId },
      attributes: ["id"],
    });

    if (
      activityQuestions.length > 0 &&
      (!questions || questions.length === 0)
    ) {
      res.status(400).json({
        message: "Esta actividad requiere responder preguntas",
      });
    }

    const validQuestionIds = activityQuestions.map((q) => q.id);

    for (let q of questions || []) {
      if (!validQuestionIds.includes(q.id)) {
        res.status(400).json({
          message: `La pregunta con id ${q.id} no pertenece a la actividad`,
        });
      }
    }

    if (activityExist?.dataValues) {
      await ActivityEntry.update(
        {
          status: "pending",
          file: req.body.file,
        },
        {
          where: {
            activity_id: activityId,
            user_id: userId,
            status: "rejected",
          },
        },
      );
      res.status(201).json({
        message: "Participación registrada, pendiente de revisión",
        activityExist,
      });
      return;
    }

    const t = await sequelize.transaction();

    try {
      const entry = await ActivityEntry.create(
        {
          user_id: userId,
          activity_id: activityId,
          file: req.body.file,
        },
        { transaction: t },
      );

      if (activityQuestions.length > 0) {
        const answersToCreate = questions.map((q: any) => ({
          activity_question_id: q.id,
          status: "pending",
          answer: q.answer,
          user_id: userId,
        }));

        await ActivityAnswer.bulkCreate(answersToCreate, { transaction: t });
      }

      await t.commit();

      res.status(201).json({
        message: "Participación registrada, pendiente de revisión",
        entry,
      });
    } catch (error) {
      await t.rollback();
      throw error;
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getEntries = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const isAdmin = req.user?.role === "admin";
    const entries = await ActivityEntry.findAll({
      attributes: [
        "id",
        "user_id",
        "activity_id",
        "status",
        "reviewed_by",
        "review_notes",
        "file",
        "created_at",
        "updated_at",
      ],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
        {
          model: Activity,
          as: "activity",
          attributes: ["id", "name", "points_reward"],
          include: [
            {
              model: ActivityQuestion,
              as: "questions",
              attributes: ["id", "question"],
              required: false,
            },
          ],
        },
        ...(isAdmin
          ? [
              {
                model: User,
                as: "reviewer",
                attributes: ["id", "name", "avatar"],
                required: false,
              },
            ]
          : []),
      ],
      order: [["created_at", "DESC"]],
    });

    const plainEntries = entries.map((e) => e.get({ plain: true }) as any);

    // Batch-load all answers for all questions/users found in the entries
    const allQuestionIds = plainEntries.flatMap((e) =>
      ((e.activity as any)?.questions ?? []).map((q: any) => q.id),
    );
    const allUserIds = [...new Set(plainEntries.map((e) => e.user_id))];

    if (allQuestionIds.length > 0) {
      const answers = await ActivityAnswer.findAll({
        where: { activity_question_id: allQuestionIds, user_id: allUserIds },
        attributes: [
          "id",
          "answer",
          "status",
          "activity_question_id",
          "user_id",
        ],
      });

      const answerMap: Record<string, object> = {};
      answers.forEach((a) => {
        const p = a.get({ plain: true });
        answerMap[`${p.activity_question_id}-${p.user_id}`] = p;
      });

      plainEntries.forEach((entry) => {
        ((entry.activity as any)?.questions ?? []).forEach((q: any) => {
          q.answers = answerMap[`${q.id}-${entry.user_id}`] ?? null;
        });
      });
    }

    res.json(plainEntries);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const reviewEntry = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const entry = await ActivityEntry.findByPk(String(req.params.id), {
      include: [{ association: "activity" }],
    });
    if (!entry) {
      res.status(404).json({ message: "Participacion no encontrada" });
      return;
    }
    if (entry.status !== "pending") {
      res.status(400).json({ message: "Ya fue revisada" });
      return;
    }

    const { status, review_notes } = req.body;
    const activity = (entry as any).activity as {
      points_reward: number;
      name: string;
    };

    if (status === "rejected") {
      if (!review_notes || String(review_notes).trim() === "") {
        res.status(400).json({ message: "La razon de rechazo es obligatoria" });
        return;
      }
      if (entry.file) await deleteActivityEntryFile(entry.file);

      // Rechazar todas las respuestas pendientes de esta participación
      const questions = await ActivityQuestion.findAll({
        where: { activity_id: entry.activity_id },
        attributes: ["id"],
      });
      if (questions.length > 0) {
        await ActivityAnswer.update(
          { status: "rejected" },
          {
            where: {
              activity_question_id: questions.map((q) => q.id),
              user_id: entry.user_id,
              status: "pending",
            },
          },
        );
      }

      await entry.update({ status, reviewed_by: req.user!.id, review_notes });
      await createNotification(
        entry.user_id,
        `Tu participacion en "${activity?.name}" fue rechazada. Motivo: ${review_notes}`,
        "warning",
      );
      res.json({ message: "Participacion rechazada", entry });
      return;
    }

    // ── Aprobación ──
    await entry.update({ status, reviewed_by: req.user!.id, review_notes });

    const questions = await ActivityQuestion.findAll({
      where: { activity_id: entry.activity_id },
      attributes: ["id"],
    });

    const allAnswersApproved =
      questions.length === 0 ||
      (await (async () => {
        const answers = await ActivityAnswer.findAll({
          where: {
            activity_question_id: questions.map((q) => q.id),
            user_id: entry.user_id,
          },
        });
        return (
          answers.length === questions.length &&
          answers.every((a) => a.status === "approved")
        );
      })());

    if (allAnswersApproved) {
      const alreadyAwarded = await PointHistory.findOne({
        where: {
          user_id: entry.user_id,
          description: `Actividad aprobada: ${activity?.name}`,
          action: "earned",
        },
      });
      const alreadyReverted = await PointHistory.findOne({
        where: {
          user_id: entry.user_id,
          description: `Actividad revertida: ${activity.name}`,
          action: "reverted",
        },
      });

      const canAward = !alreadyAwarded || (alreadyAwarded && alreadyReverted);
      if (allAnswersApproved && activity && canAward) {
        const user = await User.findByPk(entry.user_id);
        if (user) {
          await user.update({ points: user.points + activity.points_reward });
          await PointHistory.create({
            user_id: user.id,
            points: activity.points_reward,
            action: "earned",
            description: `Actividad aprobada: ${activity.name}`,
            assigned_by: req.user!.id,
          });
          await createNotification(
            user.id,
            `¡Ganaste ${activity.points_reward} puntos por "${activity.name}"!`,
            "success",
          );
        }
      }
    } else {
      await createNotification(
        entry.user_id,
        `Tu participacion en "${activity?.name}" fue aprobada. Tus respuestas aún están pendientes de revisión.`,
        "success",
      );
    }

    res.json({ message: "Participacion revisada", entry });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const updateAnswer = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const answer = await ActivityAnswer.findOne({
      where: { id: String(req.params.id), user_id: req.user!.id },
    });

    if (!answer) {
      res.status(404).json({ message: "Respuesta no encontrada" });
      return;
    }

    if (answer.status !== "rejected") {
      res
        .status(400)
        .json({ message: "Solo se pueden editar respuestas rechazadas" });
      return;
    }

    await answer.update({ answer: req.body.answer, status: "pending" });
    res.json(answer);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const reviewAnswer = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const answer = await ActivityAnswer.findByPk(String(req.params.id));
    if (!answer) {
      res.status(404).json({ message: "Respuesta no encontrada" });
      return;
    }

    const { status } = req.body as { status: "approved" | "rejected" };

    await answer.update({ status });

    // Buscar contexto para notificación y verificación de puntos
    const question = await ActivityQuestion.findByPk(
      answer.activity_question_id,
    );
    if (!question) {
      res.json(answer);
      return;
    }

    const activity = await Activity.findByPk(question.activity_id);
    const activityName = activity?.name ?? "";

    if (status === "rejected") {
      await createNotification(
        answer.user_id,
        `Tu respuesta en "${activityName}" fue rechazada por un moderador.`,
        "warning",
      );
      res.json(answer);
      return;
    }

    // Aprobada — notificar y verificar si se deben otorgar puntos
    await createNotification(
      answer.user_id,
      `Tu respuesta en "${activityName}" fue aprobada.`,
      "success",
    );

    // Verificar si TODAS las respuestas de este usuario para esta actividad están aprobadas
    const allQuestions = await ActivityQuestion.findAll({
      where: { activity_id: question.activity_id },
      attributes: ["id"],
    });
    const allAnswers = await ActivityAnswer.findAll({
      where: {
        activity_question_id: allQuestions.map((q) => q.id),
        user_id: answer.user_id,
      },
    });
    const allAnswersApproved =
      allAnswers.length === allQuestions.length &&
      allAnswers.every((a) => a.status === "approved");

    if (!allAnswersApproved || !activity) {
      res.json(answer);
      return;
    }

    // Verificar que el entry también esté aprobado
    const entry = await ActivityEntry.findOne({
      where: {
        user_id: answer.user_id,
        activity_id: question.activity_id,
        status: "approved",
      },
    });
    if (!entry) {
      res.json(answer);
      return;
    }

    // Verificar que no se hayan otorgado los puntos ya
    const alreadyAwarded = await PointHistory.findOne({
      where: {
        user_id: answer.user_id,
        description: `Actividad aprobada: ${activityName}`,
        action: "earned",
      },
    });

    const alreadyReverted = await PointHistory.findOne({
      where: {
        user_id: answer.user_id,
        description: `Actividad revertida: ${activityName}`,
        action: "reverted",
      },
    });

    if (alreadyAwarded && !alreadyReverted) {
      res.json(answer);
      return;
    }

    const user = await User.findByPk(answer.user_id);
    if (user) {
      await user.update({ points: user.points + activity.points_reward });
      await PointHistory.create({
        user_id: user.id,
        points: activity.points_reward,
        action: "earned",
        description: `Actividad aprobada: ${activityName}`,
        assigned_by: req.user!.id,
      });
      await createNotification(
        user.id,
        `¡Ganaste ${activity.points_reward} puntos por "${activityName}"! Todas tus respuestas fueron aprobadas.`,
        "success",
      );
    }

    res.json(answer);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const revertEntry = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { activity_id, user_id, id, review_notes } = req.body;
    const activity = await Activity.findByPk(activity_id);
    const user = await User.findByPk(user_id);
    const entry = await ActivityEntry.findByPk(id);

    if (!activity) {
      res.status(404).json({ message: "Actividad no encontrada" });
      return;
    }

    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    if (!entry || entry?.status !== "approved") {
      res.status(400).json({
        message:
          "No se puede revertir una participación que no este aprobada o no existe",
      });
      return;
    }

    if (!review_notes || String(review_notes).trim() === "") {
      res.status(400).json({ message: "La razon de revertir es obligatoria" });
      return;
    }

    const userActivityHistory = await PointHistory.findOne({
      where: {
        user_id: entry.user_id,
        description: `Actividad aprobada: ${activity?.name}`,
        action: "earned",
      },
    });

    if (!userActivityHistory) {
      res.status(404).json({
        message:
          "No se puede revertir porque la participación no fue previamente aprobada",
      });
      return;
    }

    const allQuestions = await ActivityQuestion.findAll({
      where: {
        activity_id: activity.id,
      },
      attributes: ["id"],
    });

    const t = await sequelize.transaction();

    try {
      if (allQuestions.length > 0) {
        // Rechazar respuestas si la actividad tiene preguntas
        await ActivityAnswer.destroy({
          where: {
            activity_question_id: { [Op.in]: allQuestions.map((q) => q.id) },
            user_id: user.id,
          },
          transaction: t,
        });
      }

      // Quitar puntos del usuario
      await user.decrement("points", {
        by: activity.points_reward,
        transaction: t,
      });

      // Actualizar la participación del usuario para rechazarlo
      await ActivityEntry.update(
        {
          status: "rejected",
          reviewed_by: req.user!.id,
          review_notes: review_notes,
        },
        {
          where: {
            id: id,
          },
          transaction: t,
        },
      );

      // Crear historial de la reversión
      await PointHistory.create(
        {
          user_id: user.id,
          points: -activity.points_reward,
          action: "reverted",
          description: `Actividad revertida: ${activity.name}`,
          assigned_by: req.user!.id,
        },
        { transaction: t },
      );

      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }

    // Borrar archivo
    if (entry.file) await deleteActivityEntryFile(entry.file);

    // Crear notificación
    await createNotification(
      user.id,
      `¡Perdiste ${activity.points_reward} puntos por "${activity.name}"! Favor de volver a ver la actividad.`,
      "warning",
    );

    res.status(200).json({
      message: "Participación revertida",
    });
    return;
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};
