import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { Storage } from "@google-cloud/storage";
import { AuthRequest, AuthRequestFile } from "../types";
// import { Agreement, ChildrenDay } from "../models";
import sharp from "sharp";

const storage = new Storage({
  credentials: JSON.parse(process.env.GCP_KEY as string),
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME as string);
const bucketPublic = storage.bucket(
  process.env.GCS_BUCKET_NAME_PUBLIC as string,
);

export const prizeCloud = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No se recibió imagen" });
      return;
    }
    const webpBuffer = await sharp(req.file.buffer)
      .webp({ quality: 82 })
      .toBuffer();
    const objectName = `prizes/${Date.now()}-${crypto.randomUUID()}.webp`;
    const gcsFile = bucketPublic.file(objectName);
    await gcsFile.save(webpBuffer, {
      contentType: "image/webp",
      resumable: false,
    });
    const publicUrl = `https://storage.googleapis.com/${bucketPublic.name}/${objectName}`;
    res.json({ objectName, publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error procesando imagen" });
  }
};
export const activityCloud = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No se recibió imagen" });
      return;
    }
    const webpBuffer = await sharp(req.file.buffer)
      .webp({ quality: 82 })
      .toBuffer();
    const objectName = `activity/${Date.now()}-${crypto.randomUUID()}.webp`;
    const gcsFile = bucketPublic.file(objectName);
    await gcsFile.save(webpBuffer, {
      contentType: "image/webp",
      resumable: false,
    });
    const publicUrl = `https://storage.googleapis.com/${bucketPublic.name}/${objectName}`;
    res.json({ objectName, publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error procesando imagen" });
  }
};

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_IMAGE_EXTS = ["jpg", "jpeg", "png", "webp", "gif"];
const ALLOWED_ENTRY_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "video/mp4", "video/quicktime", "video/webm",
  "application/pdf",
];
const ALLOWED_ENTRY_EXTS = [
  "jpg", "jpeg", "png", "webp", "gif",
  "mp4", "mov", "webm",
  "pdf",
];

export const redemptionsUpload = async (
  req: AuthRequestFile,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { filename, contentType } = req.body;
    if (!filename || !contentType) return next();
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_IMAGE_EXTS.includes(ext) || !ALLOWED_IMAGE_TYPES.includes(contentType)) {
      res.status(400).json({ message: "Tipo de archivo no permitido. Solo imágenes (jpg, png, webp, gif)." });
      return;
    }
    const objectName = `redemptions/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const file = bucketPublic.file(objectName);
    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 5 * 60 * 1000,
      contentType,
    });
    const publicUrl = `https://storage.googleapis.com/${bucketPublic.name}/${objectName}`;
    req.uploadedFile = { url, objectName, publicUrl };
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generando signed upload URL" });
  }
};

export const agreementUpload = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No se recibió imagen" });
      return;
    }
    const webpBuffer = await sharp(req.file.buffer)
      .webp({ quality: 82 })
      .toBuffer();
    const objectName = `agreements/${Date.now()}-${crypto.randomUUID()}.webp`;
    const gcsFile = bucketPublic.file(objectName);
    await gcsFile.save(webpBuffer, {
      contentType: "image/webp",
      resumable: false,
    });
    const publicUrl = `https://storage.googleapis.com/${bucketPublic.name}/${objectName}`;
    res.json({ objectName, publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error procesando imagen" });
  }
};

// Events
const uploadEventImage = async (
  req: Request,
  res: Response,
  folder: "banners" | "locations" | "gallery",
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        message: "No se recibió imagen",
      });

      return;
    }

    const webpBuffer = await sharp(req.file.buffer)
      .webp({
        quality: 82,
      })
      .toBuffer();

    const objectName = `events/${folder}/${Date.now()}-${crypto.randomUUID()}.webp`;

    const gcsFile = bucketPublic.file(objectName);

    await gcsFile.save(webpBuffer, {
      contentType: "image/webp",
      resumable: false,
    });

    const publicUrl = `https://storage.googleapis.com/${bucketPublic.name}/${objectName}`;

    res.json({
      objectName,
      publicUrl,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Error procesando imagen",
    });
  }
};

const allowedFolders = ["banners", "gallery", "locations"] as const;

type EventFolder = (typeof allowedFolders)[number];

export const eventUpload = async (req: Request, res: Response) => {
  try {
    const folder = req.params.folder as EventFolder;

    if (!allowedFolders.includes(folder)) {
      return res.status(400).json({
        message: "Folder inválido",
      });
    }
    if (!req.file) {
      res.status(400).json({
        message: "No se recibió imagen",
      });

      return;
    }

    const webpBuffer = await sharp(req.file.buffer)
      .webp({
        quality: 82,
      })
      .toBuffer();

    const objectName = `events/${folder}/${Date.now()}-${crypto.randomUUID()}.webp`;

    const gcsFile = bucketPublic.file(objectName);

    await gcsFile.save(webpBuffer, {
      contentType: "image/webp",
      resumable: false,
    });

    const publicUrl = `https://storage.googleapis.com/${bucketPublic.name}/${objectName}`;

    res.json({
      objectName,
      publicUrl,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Error procesando imagen",
    });
  }
};

export const googleActivityEntries = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { filename, contentType } = req.body;

    if (!filename) {
      res.status(400).json({ message: "filename es requerido" });
      return;
    }

    const ext = filename.split(".").pop()?.toLowerCase() || "";
    const resolvedContentType =
      contentType && contentType.trim() !== ""
        ? contentType
        : "application/octet-stream";

    if (!ALLOWED_ENTRY_EXTS.includes(ext) || !ALLOWED_ENTRY_TYPES.includes(resolvedContentType)) {
      res.status(400).json({ message: "Tipo de archivo no permitido. Solo imágenes (jpg, png, webp, gif), videos (mp4, mov, webm) o PDF." });
      return;
    }

    const objectName = `activity_entries/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const isVideo = resolvedContentType.startsWith("video/");
    const expiryMs = isVideo ? 60 * 60 * 1000 : 10 * 60 * 1000;

    const file = bucket.file(objectName);

    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + expiryMs,
      contentType: resolvedContentType,
    });

    res.json({ url, objectName, contentType: resolvedContentType });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generando signed upload URL" });
  }
};

export const getActivityFile = async (req: AuthRequest, res: Response) => {
  try {
    const filePath = req.body.file;
    if (!filePath || typeof filePath !== "string" || !filePath.startsWith("activity_entries/")) {
      res.status(400).json({ message: "Ruta de archivo no válida" });
      return;
    }
    const file = bucket.file(filePath);
    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + 2 * 60 * 1000,
    });
    res.json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Comprueba que un objeto de participación exista en el bucket privado y
 * tenga tamaño > 0. Se usa antes de crear un ActivityEntry para evitar
 * que se registren participaciones con archivos de 0 bytes cuando el PUT
 * firmado falló o subió un cuerpo vacío desde el cliente.
 */
export const verifyActivityEntryFile = async (
  objectName: string,
): Promise<{ ok: true; size: number } | { ok: false; reason: string }> => {
  if (!objectName || typeof objectName !== "string") {
    return { ok: false, reason: "missing" };
  }
  try {
    const [metadata] = await bucket.file(objectName).getMetadata();
    const size = Number(metadata?.size ?? 0);
    if (!Number.isFinite(size) || size <= 0) {
      return { ok: false, reason: "empty" };
    }
    return { ok: true, size };
  } catch (err: any) {
    if (err?.code === 404) return { ok: false, reason: "not_found" };
    console.error("verifyActivityEntryFile error:", err);
    return { ok: false, reason: "error" };
  }
};

/**
 * Elimina un archivo de activity_entries del bucket privado.
 * Se usa al rechazar una participación para liberar espacio y permitir re-envío.
 */
export const deleteActivityEntryFile = async (
  objectName: string,
): Promise<void> => {
  if (!objectName) return;
  try {
    await bucket.file(objectName).delete();
  } catch (err: any) {
    // Si el archivo no existe simplemente lo ignoramos
    if (err?.code !== 404) {
      console.error("Error eliminando archivo de GCS:", err);
    }
  }
};

//children day subida de la imagen de participacion
// export const childrenDayUpload = async (
//   req: AuthRequest,
//   res: Response,
// ): Promise<void> => {
//   try {
//     if (!req.file) {
//       console.log("1");

//       res.status(400).json({ message: "No se recibió imagen" });
//       return;
//     }
//     const exist = await ChildrenDay.findOne({
//       where: { user_id: req.user!.id },
//     });

//     if (exist) {
//       console.log("2");

//       res.status(400).json({ message: "Ya estas participando " });
//       return;
//     }

//     const webpBuffer = await sharp(req.file.buffer)
//       .webp({ quality: 82 })
//       .toBuffer();
//     const objectName = `children_day/${Date.now()}-${crypto.randomUUID()}.webp`;
//     const gcsFile = bucketPublic.file(objectName);
//     await gcsFile.save(webpBuffer, {
//       contentType: "image/webp",
//       resumable: false,
//     });
//     const publicUrl = `https://storage.googleapis.com/${bucketPublic.name}/${objectName}`;

//     await ChildrenDay.create({ image: publicUrl, user_id: req.user!.id });

//     res.json("Participacion subida!");
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error procesando imagen" });
//   }
// };
