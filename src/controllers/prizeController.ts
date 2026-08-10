import { Response } from "express";
import { Prize, State, User } from "../models";
import { AuthRequest } from "../types";
import { createNotification } from "../services/notificationService";
import PrizeState from "../models/PrizeState";
import { Op, Sequelize } from "sequelize";
import sequelize from "../config/database";

export const getPrizes = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const where: Record<string, unknown> = {};

    const isAdmin = req.user?.role === "admin";
    const userStateId = req.user?.state_id;

    if (isAdmin) {
      if (req.query.status) {
        where.status = req.query.status;
      }
    } else {
      where.status = "active";
    }

    if (req.user && !isAdmin) {
      if (!userStateId) {
        res.status(403).json({
          message:
            "No tienes una ubicación asignada. Comunícate con un administrador para más información.",
        });
        return;
      }

      const state = await State.findByPk(userStateId);

      if (!state || state.status === "inactive") {
        res.status(403).json({
          message:
            "Tu ubicación actualmente se encuentra deshabilitada. Por favor comunícate con un administrador para más información.",
        });
        return;
      }

      const safeStateId = Number(userStateId);

      Object.assign(where, {
        [Op.or]: [
          Sequelize.literal(`
        NOT EXISTS (
          SELECT 1
          FROM prizes_states ps
          WHERE ps.prize_id = Prize.id
        )
      `),
          Sequelize.literal(`
        EXISTS (
          SELECT 1
          FROM prizes_states ps
          INNER JOIN states s
            ON s.id = ps.state_id
          WHERE ps.prize_id = Prize.id
            AND s.status = 'active'
            AND ps.state_id = ${sequelize.escape(safeStateId)}
        )
      `),
        ],
      });
    }

    const prizes = await Prize.findAll({
      where,
      include: isAdmin
        ? [
            {
              model: State,
              as: "states",
              through: { attributes: [] },
              required: false,
            },
          ]
        : [],
      order: [["id", "DESC"]],
    });

    const prizeWithStateIds = prizes.map((prize) => {
      const json = prize.toJSON() as Prize & {
        states?: State[];
      };

      return {
        ...json,
        state_ids: json.states?.map((s) => s.id) ?? [],
      };
    });

    res.json(prizeWithStateIds);
  } catch {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getPrizeById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const prize = await Prize.findByPk(String(req.params.id), {
      include: {
        model: State,
        as: "states",
        through: { attributes: [] },
        required: false,
      },
    });

    if (!prize) {
      res.status(404).json({ message: "Premio no encontrado" });
      return;
    }

    const isAdmin = req.user?.role === "admin";

    if (!isAdmin) {
      if (prize.status !== "active") {
        res.status(404).json({ message: "Premio no disponible" });
        return;
      }

      const prizeStates = (prize.get("states") as State[]) ?? [];
      const isGlobal = prizeStates.length === 0;
      const userStateId = req.user?.state_id;

      const inUserState =
        !!userStateId &&
        prizeStates.some(
          (s) => s.id === userStateId && s.status === "active",
        );

      if (!isGlobal && !inUserState) {
        res
          .status(403)
          .json({ message: "Este premio no está disponible en tu estado." });
        return;
      }
    }

    res.json(prize);
  } catch {

    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const createPrize = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, description, state_ids = [], image, points_required, stock, allow_multiple_redemptions, delivery_time_min, delivery_time_max, delivery_time_unit } = req.body;

    if (Array.isArray(state_ids) && state_ids.length > 0) {
      const activeStates = await State.findAll({
        where: {
          id: state_ids,
          status: "active",
        },
        attributes: ["id"],
        raw: true,
      });

      const activeIds = activeStates.map((s) => s.id);

      const invalidIds = state_ids.filter(
        (id: number) => !activeIds.includes(id),
      );

      if (invalidIds.length > 0) {
        res.status(400).json({
          message: "Algunos estados no están activos",
          invalid_state_ids: invalidIds,
        });
        return;
      }
    }

    const prize = await Prize.create({
      name: name?.trim().toLowerCase(),
      description: description?.trim(),
      image,
      points_required,
      stock,
      allow_multiple_redemptions,
      delivery_time_min,
      delivery_time_max,
      delivery_time_unit
    });

    // Solo crear relaciones si se seleccionaron estados específicos
    if (state_ids.length > 0) {
      await PrizeState.bulkCreate(
        state_ids.map((stateId: number) => ({
          prize_id: prize.id,
          state_id: stateId,
        })),
      );
    }

    for (let s of state_ids) {
      const users = await User.findAll({
        where: { status: "active", state_id: s },
        attributes: ["id"],
        raw: true,
      });
      

      const message = `Se acaba de agregar un nuevo premio: ${name?.trim().toUpperCase()}, participa para ganar!`;
      users.forEach((u, i) => {
        setTimeout(() => createNotification(u.id, message, "info"), i * 3000);
      });
    }

    res.status(201).json(prize);
  } catch {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const updatePrize = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const prize = await Prize.findByPk(String(req.params.id));

    if (!prize) {
      res.status(404).json({ message: "Premio no encontrado" });
      return;
    }

    const includesStateChange = Object.prototype.hasOwnProperty.call(
      req.body,
      "state_ids",
    );
    const { state_ids = [], name, description, image, points_required, stock, allow_multiple_redemptions, status, delivery_time_min, delivery_time_max, delivery_time_unit } = req.body;

    if (includesStateChange && Array.isArray(state_ids) && state_ids.length > 0) {
      const activeStates = await State.findAll({
        where: {
          id: state_ids,
          status: "active",
        },
        attributes: ["id"],
        raw: true,
      });

      const activeIds = activeStates.map((s) => s.id);

      const invalidIds = state_ids.filter(
        (id: number) => !activeIds.includes(id),
      );

      if (invalidIds.length > 0) {
        res.status(400).json({
          message: "Algunos estados no están activos",
          invalid_state_ids: invalidIds,
        });
        return;
      }
    }

    const resolvedImage =
      (req.file as Express.Multer.File | undefined)?.filename || image || prize.image;

    await prize.update({
      name: name?.trim().toLowerCase(),
      description: description?.trim(),
      image: resolvedImage,
      points_required,
      stock,
      allow_multiple_redemptions,
      status,
      delivery_time_min,
      delivery_time_max,
      delivery_time_unit
    });

    if (includesStateChange) {
      await PrizeState.destroy({
        where: {
          prize_id: prize.id,
        },
      });

      if (Array.isArray(state_ids) && state_ids.length > 0) {
        await PrizeState.bulkCreate(
          state_ids.map((stateId: number) => ({
            prize_id: prize.id,
            state_id: stateId,
          })),
        );
      }
    }

    res.json(prize);
  } catch {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const deletePrize = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const prize = await Prize.findByPk(String(req.params.id));
    if (!prize) {
      res.status(404).json({ message: "Premio no encontrado" });
      return;
    }
    await prize.update({ status: "inactive" });
    res.json({ message: "Premio desactivado" });
  } catch {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
