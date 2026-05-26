import { Request, Response } from "express";
import Event from "../models/Event";
import { AuthRequest } from "../types";
import LocationImage from "../models/LocationImage";
import EventRegistration from "../models/EventRegistration";
import { Notification, User } from "../models";
import { Op } from "sequelize";
import { createNotification } from "../services/notificationService";

export const getEvents = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const where: Record<string, unknown> = {};

    const isAdmin = req.user?.role === "admin";

    if (req.query.status) {
      where.status = req.query.status;
    }

    if (req.query.category) {
      where.category = req.query.category;
    }

    if (!isAdmin) {
      where.status = "active";
    }

    // Desactivar eventos finalizados
    await Event.update(
      { status: "inactive" },
      {
        where: {
          status: "active",
          end_at: {
            [Op.lt]: new Date(),
          },
        },
      },
    );

    const events = await Event.findAll({
      where,
      include: [
        {
          model: LocationImage,
          as: "images",
        },
        {
          model: EventRegistration,
          as: "registrations",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
      order: isAdmin ? [["id", "DESC"]] : [["start_at", "ASC"]],
    });

    res.json(events);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Error al obtener eventos",
      error: err,
    });
  }
};

export const getEventById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const event = await Event.findByPk(String(req.params.id), {
      include: [
        {
          model: LocationImage,
          as: "images",
        },
      ],
    });

    if (!event) {
      res.status(404).json({
        message: "Evento no encontrado",
      });

      return;
    }

    res.json(event);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Error al obtener evento",
      error: err,
    });
  }
};

export const createEvent = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, description, gallery = [], thumbnail, ...rest } = req.body;

    const formattedData = {
      ...rest,
      name: name?.trim(),
      description: description?.trim(),
      thumbnail: thumbnail?.url ?? "",
    };

    const event = await Event.create(formattedData);

    if (Array.isArray(gallery) && gallery.length > 0) {
      const formattedImages = gallery.map((img: { url: string }) => ({
        event_id: event.id,
        url: img.url,
      }));

      await LocationImage.bulkCreate(formattedImages);
    }

    const createdEvent = await Event.findByPk(event.id, {
      include: [
        {
          model: LocationImage,
          as: "images",
        },
      ],
    });

    res.status(201).json(createdEvent);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Error al crear evento",
      error: err,
    });
  }
};

export const updateEvent = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const event = await Event.findByPk(String(req.params.id));

    if (!event) {
      res.status(404).json({
        message: "Evento no encontrado",
      });

      return;
    }

    const { gallery, thumbnail, name, description, ...rest } = req.body;

    await event.update({
      ...rest,
      name: name?.trim(),
      description: description?.trim(),
      thumbnail: thumbnail?.url ?? event.thumbnail,
    });

    if (Array.isArray(gallery)) {
      await LocationImage.destroy({
        where: {
          event_id: event.id,
        },
      });

      if (gallery.length > 0) {
        const formattedImages = gallery.map((img: { url: string }) => ({
          event_id: event.id,
          url: img.url,
        }));

        await LocationImage.bulkCreate(formattedImages);
      }
    }

    const updatedEvent = await Event.findByPk(event.id, {
      include: [
        {
          model: LocationImage,
          as: "images",
        },
      ],
    });

    res.json(updatedEvent);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Error al actualizar evento",
      error: err,
    });
  }
};

export const deleteEvent = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const event = await Event.findByPk(String(req.params.id));

    if (!event) {
      res.status(404).json({
        message: "Evento no encontrado",
      });

      return;
    }

    await event.destroy();

    res.json({
      message: "Evento eliminado",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Error al eliminar evento",
      error: err,
    });
  }
};

export const cancelEvent = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const event = await Event.findByPk(String(req.params.id), {
      include: [
        {
          model: EventRegistration,
          as: "registrations",
          include: [
            {
              model: User,
              as: "user",
              where: {
                status: "active",
              },
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
    });

    if (!event) {
      res.status(404).json({
        message: "Evento no encontrado",
      });

      return;
    }

    // Obtener usuarios registrados
    const users =
      (event.get("registrations") as any[])
        ?.map((registration) => registration.user)
        .filter(Boolean) ?? [];

    // Crear mensaje
    const message = `El evento "${event.name}" ha sido cancelado.`;

    // Crear notificaciones
    if (users.length > 0) {
      await Promise.all(
        users.map((user: User) =>
          createNotification(user.id, message, "warning"),
        ),
      );
    }

    // Cambiar estado del evento
    await event.update({
      status: "cancelled",
    });

    res.json({
      message: "Evento cancelado",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Error al eliminar evento",
      error: err,
    });
  }
};

// EVENT REGISTRATIONS
export const getEventRegistrations = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const eventId = req.params.id;

    const registrations = await EventRegistration.findAll({
      where: {
        event_id: eventId,
      },

      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],

      order: [["id", "DESC"]],
    });

    res.json(registrations);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Error al obtener registros",
      error: err,
    });
  }
};

export const registerToEvent = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const eventId = req.params.id;
    if (!eventId) {
      res.status(404).json({
        message: "Falta ID del evento",
      });

      return;
    }

    const event = await Event.findByPk(Number(eventId));

    if (!event) {
      res.status(404).json({
        message: "Evento no encontrado",
      });

      return;
    }

    const existingRegistration = await EventRegistration.findOne({
      where: {
        event_id: eventId,
        user_id: userId,
      },
    });

    if (existingRegistration) {
      res.status(400).json({
        message: "Ya estás registrado en este evento",
      });

      return;
    }

    const registration = await EventRegistration.create({
      event_id: Number(eventId),
      user_id: Number(userId),
    });

    res.status(201).json(registration);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Error al registrarse al evento",
      error: err,
    });
  }
};
