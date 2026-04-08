import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { Storage } from "@google-cloud/storage";
import { AuthRequest, AuthRequestFile } from "../types";
import { Agreement, ChildrenDay } from "../models";
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

export const redemptionsUpload = async (
  req: AuthRequestFile,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { filename, contentType } = req.body;
    if (!filename || !contentType) return next();
    const ext = filename.split(".").pop()?.toLowerCase() || "bin";
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

export const googleActivityEntries = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { filename, contentType } = req.body;

    const ext = filename.split(".").pop()?.toLowerCase() || "bin";
    const objectName = `activity_entries/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const file = bucket.file(objectName);

    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 5 * 60 * 1000,
      contentType,
    });

    res.json({ url, objectName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generando signed upload URL" });
  }
};

export const getActivityFile = async (req: AuthRequest, res: Response) => {
  const file = bucket.file(req.body.file);
  const [url] = await file.getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + 2 * 60 * 1000,
  });
  res.json({ url });
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
export const childrenDayUpload = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.file) {
      console.log("1");

      res.status(400).json({ message: "No se recibió imagen" });
      return;
    }
    const exist = await ChildrenDay.findOne({
      where: { user_id: req.user!.id },
    });

    if (exist) {
      console.log("2");

      res.status(400).json({ message: "Ya estas participando " });
      return;
    }

    const webpBuffer = await sharp(req.file.buffer)
      .webp({ quality: 82 })
      .toBuffer();
    const objectName = `children_day/${Date.now()}-${crypto.randomUUID()}.webp`;
    const gcsFile = bucketPublic.file(objectName);
    await gcsFile.save(webpBuffer, {
      contentType: "image/webp",
      resumable: false,
    });
    const publicUrl = `https://storage.googleapis.com/${bucketPublic.name}/${objectName}`;

    await ChildrenDay.create({ image: publicUrl, user_id: req.user!.id });

    res.json("Participacion subida!");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error procesando imagen" });
  }
};
