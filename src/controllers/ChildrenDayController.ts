import { col, fn, where } from "sequelize";
import { ChildrenDay, ChildrenDayVotes } from "../models";
import { AuthRequest } from "../types";
import { Response } from "express";
import sequelize from "../config/database";
export const getParticipate = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const userId = req.user?.id;

  try {
    if (!userId) {
      res.status(401).json({
        message: "Usuario no autenticado",
      });
      return;
    }

    const [childrenDayRecord, voteRecord] = await Promise.all([
      ChildrenDay.findOne({
        where: { user_id: userId },
        attributes: ["id"],
      }),
      ChildrenDayVotes.findOne({
        where: { user_id: userId },
        attributes: ["id"],
      }),
    ]);
    console.log("resultado", {
      exist: !!childrenDayRecord,
      participate: !!voteRecord,
    });

    res.status(200).json({
      exist: !!childrenDayRecord,
      participate: !!voteRecord,
    });
  } catch (err) {
    console.error("Error in getParticipate:", err);

    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

export const getParticipatingUsers = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const participate = await ChildrenDay.findAll({
      attributes: [
        "id",
        "image",
        [sequelize.fn("COUNT", sequelize.col("votes.id")), "votes"],
      ],
      include: [
        {
          association: "user",
          attributes: ["id", "name", "avatar"],
        },
        {
          association: "votes",
          attributes: [],
          required: false,
        },
      ],
      group: ["ChildrenDay.id", "user.id", "user.name"],
      subQuery: false,
      raw: true,
      nest: true,
    });
    res.status(200).json(participate);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const vote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res
        .status(400)
        .json({ message: "Identificador del usuario no encontrado" });
      return;
    }
    if (!req.params.id) {
      res
        .status(400)
        .json({ message: "Identificador de la votacion no encontrado" });
      return;
    }

    const exist = await ChildrenDayVotes.findOne({
      where: { user_id: req.user.id },
    });
    if (exist) {
      res
        .status(400)
        .json({ message: "Usted actualmente ya voto quiere cambiar su voto" });
      return;
    }
    await ChildrenDayVotes.create({
      user_id: req.user.id,
      children_day_id: Number(req.params.id),
    });
    res.status(200).json({ message: "¡Voto registrado!" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const changeVote = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      res
        .status(400)
        .json({ message: "Identificador del usuario no encontrado" });
      return;
    }
    if (!req.params.id) {
      res
        .status(400)
        .json({ message: "Identificador de la votacion no encontrado" });
      return;
    }

    await ChildrenDayVotes.update(
      { children_day_id: Number(req.params.id) },
      { where: { user_id: req.user?.id } },
    );
    res.status(200).json({ message: "Voto actualizado" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};
