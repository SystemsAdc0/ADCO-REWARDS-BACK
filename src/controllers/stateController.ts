import { State } from "../models";
import PrizeState from "../models/PrizeState";
import { AuthRequest } from "../types";
import { Response } from "express";

const normalizeForCompare = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos
    .replace(/\s+/g, ""); // quita todos los espacios

export const getStates = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const states = await State.findAll({
      attributes: ["id", "name", "status"],
    });

    res.json(states);
  } catch (err) {
    console.log(err);

    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const createState = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name } = req.body;

    if (!name) {
      res.status(400).json({
        message: "Falta el nombre",
      });

      return;
    }

    const nameFormatted = name?.trim().toLowerCase();

    // Lo que se usará para comparar
    const normalizedName = normalizeForCompare(name);

    const states = await State.findAll({
      attributes: ["id", "name"],
    });

    const exists = states.some(
      (state) => normalizeForCompare(state.name) === normalizedName,
    );

    if (exists) {
      res.status(403).json({
        message: "Ya existe un estado con ese nombre",
      });
      return;
    }

    const state = await State.create({ name: String(nameFormatted) });

    const createdState = await State.findByPk(state.id);

    res.status(201).json(createdState);
  } catch (err) {
    console.log(err);

    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const updateState = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, status } = req.body;
    const state = await State.findByPk(String(req.params.id));

    if (!state) {
      res.status(404).json({
        message: "Estado no encontrado",
      });
      return;
    }

    const bodyFormatted: Record<string, unknown> = {};

    if (status !== undefined) {
      bodyFormatted.status = status;
    }

    if (name) {
      const nameFormatted = name.trim().toLowerCase();

      const normalizedName = normalizeForCompare(name);

      const states = await State.findAll({
        attributes: ["id", "name"],
      });

      const exists = states.some(
        (state) => normalizeForCompare(state.name) === normalizedName,
      );

      if (exists) {
        res.status(403).json({
          message: "Ya existe un estado con ese nombre",
        });
        return;
      }

      bodyFormatted.name = nameFormatted;
    }

    await state.update(bodyFormatted);

    // Si el estado fue desactivado, eliminar relaciones con premios
    if (state.status === "inactive") {
      await PrizeState.destroy({
        where: {
          state_id: state.id,
        },
      });
    }

    const updatedState = await State.findByPk(state.id);

    res.json(updatedState);
  } catch (err) {
    console.log(err);

    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const deleteState = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const state = await State.findByPk(String(req.params.id));

    if (!state) {
      res.status(404).json({
        message: "Evento no encontrado",
      });

      return;
    }

    // await state.destroy();

    res.json({
      message: "Estado eliminado",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({ message: "Error interno del servidor" });
  }
};
