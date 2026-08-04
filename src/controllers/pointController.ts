import { Response } from "express";
import { AuthRequest } from "../types";
import { PointHistory } from "../models";
import { parsePagination, paginatedResponse } from "../utils/pagination";

export const getMyHistory = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { page, limit, offset } = parsePagination(req.query as Record<string, unknown>);
    const { count, rows } = await PointHistory.findAndCountAll({
      where: { user_id: req.user!.id },
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });
    res.json(paginatedResponse(rows, count, page, limit));
  } catch {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getUserHistory = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { page, limit, offset } = parsePagination(req.query as Record<string, unknown>);
    const { count, rows } = await PointHistory.findAndCountAll({
      where: { user_id: req.params.userId },
      include: [{ association: "assigner", attributes: ["id", "name"] }],
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });
    res.json(paginatedResponse(rows, count, page, limit));
  } catch {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
