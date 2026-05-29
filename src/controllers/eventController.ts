import { Request, Response } from "express";
import Event from "../models/Event";
import { AuthRequest } from "../types";
import LocationImage from "../models/LocationImage";
import EventRegistration from "../models/EventRegistration";
import { User } from "../models";
import { Op, Sequelize } from "sequelize";
import { createNotification } from "../services/notificationService";
import EventImage from "../models/EventImage";
import { Storage } from "@google-cloud/storage";

const storage = new Storage({
  credentials: JSON.parse(process.env.GCP_KEY as string),
});
const bucketPublic = storage.bucket(
  process.env.GCS_BUCKET_NAME_PUBLIC as string,
);

async function deleteObjectFromGCS(objectName: string) {
  if (!objectName) return;
  try {
    await bucketPublic.file(objectName).delete();
  } catch (err: any) {
    if (err?.code !== 404) console.error("GCS delete error:", err?.message);
  }
}

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
      attributes: { exclude: ["created_at"] },
      include: [
        {
          model: LocationImage,
          as: "location_images",
        },
        {
          model: EventImage,
          as: "event_images",
        },
        {
          model: EventRegistration,
          as: "registrations",
          attributes: ["id", "event_id", "user_id"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name", "email", "avatar"],
            },
          ],
          order: [Sequelize.fn("RAND")],
        },
      ],
      order: isAdmin ? [["id", "DESC"]] : [["start_at", "DESC"]],
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
          as: "location_images",
        },
        {
          model: EventImage,
          as: "event_images",
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
      const formattedImages = gallery.map(
        (img: { url: string; objectName: string }) => ({
          event_id: event.id,
          url: img.url,
          object_name: img.objectName,
        }),
      );

      await LocationImage.bulkCreate(formattedImages);
    }

    const createdEvent = await Event.findByPk(event.id, {
      include: [
        {
          model: LocationImage,
          as: "location_images",
        },
        {
          model: EventImage,
          as: "event_images",
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

    if (Array.isArray(gallery) && gallery.length > 0) {
      // await LocationImage.destroy({
      //   where: {
      //     event_id: event.id,
      //   },
      // });

      const formattedImages = gallery.map(
        (img: { url: string; objectName: string }) => ({
          event_id: event.id,
          url: img.url,
          object_name: img.objectName,
        }),
      );

      await LocationImage.bulkCreate(formattedImages);
    }

    const updatedEvent = await Event.findByPk(event.id, {
      include: [
        {
          model: LocationImage,
          as: "location_images",
        },
        {
          model: EventImage,
          as: "event_images",
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

    // Eliminar registros del evento
    await EventRegistration.destroy({
      where: {
        event_id: event.id,
      },
    });

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

    if (event.status === "cancelled") {
      res
        .status(400)
        .json({ message: "No te puedes registrar a un evento cancelado" });
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

export const cancelRegistration = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const eventId = req.params.id;

    const registration = await EventRegistration.findOne({
      where: {
        event_id: eventId,
        user_id: req.user?.id,
      },
    });

    if (!registration) {
      res.status(404).json({
        message: "Registro no encontrado",
      });

      return;
    }

    await registration.destroy();

    res.json({
      message: "Participación cancelada",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Error al registrarse al evento",
      error: err,
    });
  }
};

export const createEventImages = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const eventId = req.params.id;

    const event = await Event.findOne({
      where: {
        id: eventId,
      },
    });

    if (!event) {
      res.status(401).json({ message: "No se encontro el evento" });

      return;
    }

    const { gallery = [] } = req.body;

    if (Array.isArray(gallery) && gallery.length > 0) {
      const formattedImages = gallery.map(
        (img: { url: string; objectName: string }) => ({
          event_id: event.id,
          url: img.url,
          object_name: img.objectName,
        }),
      );

      await EventImage.bulkCreate(formattedImages);
    }

    res.json({
      message: "Galería creada",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Error al registrarse al evento",
      error: err,
    });
  }
};

export const deleteLocationImageById = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { imageId } = req.params;
    const image = await LocationImage.findByPk(String(imageId));
    if (!image) {
      res.status(404).json({ message: "Imagen no encontrada" });
      return;
    }
    // Ensure the image belongs to the agreement
    if (String(image.event_id) !== String(req.params.id)) {
      res.status(403).json({ message: "Imagen no pertenece a este convenio" });
      return;
    }
    await deleteObjectFromGCS(image.url);
    await image.destroy();
    res.status(200).json({ message: "Imagen eliminada" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const deleteEventImageById = async (req: AuthRequest, res: Response) => {
  try {
    const { imageId } = req.params;
    const image = await EventImage.findByPk(String(imageId));
    if (!image) {
      res.status(404).json({ message: "Imagen no encontrada" });
      return;
    }
    // Ensure the image belongs to the agreement
    if (String(image.event_id) !== String(req.params.id)) {
      res.status(403).json({ message: "Imagen no pertenece a este convenio" });
      return;
    }
    await deleteObjectFromGCS(image.url);
    await image.destroy();
    res.status(200).json({ message: "Imagen eliminada" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getEventsGalleries = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const events = await Event.findAll({
      where: {
        status: "inactive",
      },
      attributes: ["id", "name", "thumbnail"],
      include: [
        {
          model: EventImage,
          as: "event_images",
          attributes: ["id", "event_id", "url"]
        },
      ],
    });

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};
