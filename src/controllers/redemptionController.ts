import { Response } from "express";
import { AuthRequest, AuthRequestFile, RedemptionStatus } from "../types";
import { Redemption, Prize, User, PointHistory, State } from "../models";
import { createNotification } from "../services/notificationService";
import { Op, Sequelize } from "sequelize";
import sequelize from "../config/database";

export const createRedemption = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user!.id;
    const userStateId = req.user?.state_id;
    const { prize_id } = req.body;

    if (!userStateId) {
      await t.rollback();
      res.status(403).json({
        message:
          "No tienes una ubicación asignada. Comunícate con un administrador.",
      });
      return;
    }

    const userState = await State.findByPk(userStateId, { transaction: t });
    if (!userState || userState.status === "inactive") {
      await t.rollback();
      res.status(403).json({
        message:
          "Tu ubicación se encuentra deshabilitada. Comunícate con un administrador.",
      });
      return;
    }

    const prize = await Prize.findByPk(prize_id, {
      include: {
        model: State,
        as: "states",
        through: { attributes: [] },
        required: false,
      },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    if (!prize || prize.status !== "active") {
      await t.rollback();
      res.status(404).json({ message: "Premio no disponible" });
      return;
    }

    if (prize.stock <= 0) {
      await t.rollback();
      res.status(400).json({ message: "Sin stock disponible" });
      return;
    }

    const prizeStates = (prize.get("states") as State[]) ?? [];
    const isGlobalPrize = prizeStates.length === 0;

    const isAvailableForUser =
      isGlobalPrize ||
      prizeStates.some(
        (state) => state.id === userStateId && state.status === "active",
      );

    if (!isAvailableForUser) {
      await t.rollback();
      res.status(403).json({
        message: "Este premio no está disponible en tu estado.",
      });
      return;
    }

    const user = await User.findByPk(userId, {
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    if (!user || user.status === "inactive") {
      await t.rollback();
      res.status(403).json({ message: "Usuario no disponible" });
      return;
    }

    if (user.points < prize.points_required) {
      await t.rollback();
      res.status(400).json({ message: "Puntos insuficientes" });
      return;
    }

    if (!prize.allow_multiple_redemptions) {
      const redemptionExist = await Redemption.findOne({
        where: {
          user_id: userId,
          prize_id,
          status: { [Op.in]: ["pending", "approved", "delivered"] },
        },
        transaction: t,
      });

      if (redemptionExist) {
        await t.rollback();
        res.status(400).json({
          message: "Este premio solo se puede canjear una vez por persona",
        });
        return;
      }
    }

    await user.update(
      { points: user.points - prize.points_required },
      { transaction: t },
    );

    const newStock = prize.stock - 1;

    await prize.update(
      {
        stock: newStock,
        status: newStock <= 0 ? "inactive" : "active",
      },
      { transaction: t },
    );

    const redemption = await Redemption.create(
      {
        user_id: userId,
        prize_id,
        points_spent: prize.points_required,
      },
      { transaction: t },
    );

    await PointHistory.create(
      {
        user_id: userId,
        points: -prize.points_required,
        action: "spent",
        description: `Canje: ${prize.name}`,
      },
      { transaction: t },
    );

    await t.commit();

    await createNotification(
      userId,
      `Canjeaste ${prize.name} por ${prize.points_required} puntos. En proceso de entrega.`,
      "success",
    );

    res.status(201).json(redemption);
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getWinners = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const redemptions = await Redemption.findAll({
      attributes: [
        "image",
        "updated_at",
        [Sequelize.col("user.name"), "winner"],
        [Sequelize.col("user.company"), "company"],
      ],
      where: {
        image: {
          [Op.ne]: null as unknown as string,
        },
      },
      include: [
        {
          association: "user",
          attributes: [],
        },
      ],
      order: [["id", "DESC"]],
      limit: 15,
      raw: true,
    });
    res.status(200).json(redemptions);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};
export const getMyRedemptions = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const redemptions = await Redemption.findAll({
      where: { user_id: req.user!.id },
      include: [{ association: "prize" }],
      order: [["created_at", "DESC"]],
    });
    res.json(redemptions);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getAllRedemptions = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const redemptions = await Redemption.findAll({
      attributes: {
        exclude: ["delivered_by", "user_id"],
      },
      include: [
        { association: "user", attributes: ["id", "name", "email"] },
        { association: "prize" },
        ...(req.user?.role === "admin"
          ? [{ association: "delivered", attributes: ["name"] }]
          : []),
      ],
      order: [["created_at", "DESC"]],
    });

    res.json(redemptions);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const updateRedemptionStatus = async (
  req: AuthRequestFile,
  res: Response,
): Promise<void> => {
  const t = await sequelize.transaction();
  try {
    const redemption = await Redemption.findByPk(String(req.params.id), {
      include: [
        { association: "prize" },
        { association: "user", attributes: ["id", "points", "email"] },
      ],
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    if (!redemption) {
      await t.rollback();
      res.status(404).json({ message: "Canje no encontrado" });
      return;
    }
    const image = req.uploadedFile?.publicUrl ?? null;
    const statusSpanish: Record<RedemptionStatus, string> = {
      pending: "Pendiente",
      approved: "Aprobado",
      delivered: "Entregado",
      rejected: "Rechazado",
    };
    const status = req.body.status as RedemptionStatus;
    const previousStatus = redemption.status;
    const updates: Partial<{
      status: RedemptionStatus;
      redeemed_at: Date;
      notes: string;
      delivered_by: number;
      image: string;
    }> = { status };
    if (!redemption.user) {
      await t.rollback();
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }
    if (status === "rejected" && previousStatus !== "rejected") {
      await User.update(
        { points: Sequelize.literal(`points + ${Number(redemption.points_spent)}`) as any },
        { where: { id: redemption.user_id }, transaction: t },
      );
      await Prize.update(
        { stock: Sequelize.literal("stock + 1") as any },
        { where: { id: redemption.prize_id }, transaction: t },
      );
    }

    if (status === "delivered") {
      updates.delivered_by = req.user?.id;
      updates.redeemed_at = new Date();
    }
    if (image) updates.image = image;
    if (req.body.notes) updates.notes = req.body.notes;

    await redemption.update(updates, { transaction: t });
    await t.commit();

    const prize = (redemption as unknown as { prize: { name: string } }).prize;
    const msg =
      status === "rejected"
        ? `Tu canje del ${prize?.name} fue cancelado, se te devolvieron ${redemption.points_spent} puntos`
        : `Tu canje de "${prize?.name}" fue actualizado a: ${statusSpanish[status]}`;

    await createNotification(redemption.user_id, msg, "info", status);
    res.json({
      message: "Estado actualizado",
      redemption,
      fileUrl: req.uploadedFile,
    });
  } catch (err) {
    await t.rollback();
    console.log(err);

    res.status(500).json({ message: "Error", error: err });
  }
};
