import { Response } from "express";
import { AuthRequest } from "../types";
import { PointRequest, User, PointHistory } from "../models";
import { createNotification } from "../services/notificationService";

export const createPointRequest = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const requesterId = req.user!.id;
    const { target_id, points, message } = req.body;

    if (!target_id || !points || points <= 0) {
      res.status(400).json({ message: "Datos inválidos" });
      return;
    }

    const requester = await User.findByPk(requesterId);
    if (!requester?.can_request_points) {
      res.status(403).json({ message: "No tienes permiso para solicitar puntos" });
      return;
    }

    const target = await User.findByPk(target_id);
    if (!target) {
      res.status(404).json({ message: "Usuario destino no encontrado" });
      return;
    }

    if (target_id === requesterId) {
      res.status(400).json({ message: "No puedes solicitarte puntos a ti mismo" });
      return;
    }

    const request = await PointRequest.create({
      requester_id: requesterId,
      target_id,
      points,
      message,
    });

    await createNotification(
      target_id,
      `${requester.name} te está solicitando ${points} puntos ${message ? `: "${message}"` : ""}. Ingresa a la sección de solicitudes para responder.`,
      "warning",
    );

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getMySentRequests = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const requests = await PointRequest.findAll({
      where: { requester_id: req.user!.id },
      include: [{ model: User, as: "target", attributes: ["id", "name", "email", "avatar"] }],
      order: [["created_at", "DESC"]],
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getIncomingRequests = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const requests = await PointRequest.findAll({
      where: { target_id: req.user!.id },
      include: [{ model: User, as: "requester", attributes: ["id", "name", "email", "avatar"] }],
      order: [["created_at", "DESC"]],
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getPendingIncomingCount = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const count = await PointRequest.count({
      where: { target_id: req.user!.id, status: "pending" },
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const respondToRequest = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const request = await PointRequest.findByPk(String(req.params.id));

    if (!request) {
      res.status(404).json({ message: "Solicitud no encontrada" });
      return;
    }

    if (request.target_id !== req.user!.id) {
      res.status(403).json({ message: "No puedes responder esta solicitud" });
      return;
    }

    if (request.status !== "pending") {
      res.status(400).json({ message: "Esta solicitud ya fue respondida" });
      return;
    }

    const { status } = req.body;
    if (status !== "accepted" && status !== "rejected") {
      res.status(400).json({ message: "Estado inválido" });
      return;
    }

    if (status === "accepted") {
      const target = await User.findByPk(request.target_id);
      if (!target) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }
      if (target.points < request.points) {
        res.status(400).json({ message: "No tienes suficientes puntos para aceptar esta solicitud" });
        return;
      }

      const requester = await User.findByPk(request.requester_id);
      if (!requester) {
        res.status(404).json({ message: "Solicitante no encontrado" });
        return;
      }

      await target.update({ points: target.points - request.points });
      await requester.update({ points: requester.points + request.points });

      await PointHistory.create({
        user_id: target.id,
        points: -request.points,
        action: "spent",
        description: `Transferencia de puntos a ${requester.name} (solicitud aceptada)`,
        assigned_by: target.id,
      });

      await PointHistory.create({
        user_id: requester.id,
        points: request.points,
        action: "earned",
        description: `Puntos recibidos de ${target.name} (solicitud aceptada)`,
        assigned_by: target.id,
      });

      await createNotification(
        requester.id,
        `${target.name} aceptó tu solicitud de ${request.points} puntos. ¡Ya están en tu cuenta!`,
        "success",
      );
    } else {
      const target = await User.findByPk(request.target_id);
      const requester = await User.findByPk(request.requester_id);
      if (requester && target) {
        await createNotification(
          requester.id,
          `${target.name} rechazó tu solicitud de ${request.points} puntos.`,
          "info",
          status
        );
      }
    }

    await request.update({ status });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
