import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { Storage } from "@google-cloud/storage";
import { AuthRequest, AuthRequestFile } from "../types";
import { Agreement } from "../models";

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
    const { filename, contentType } = req.body;

    const ext = filename.split(".").pop()?.toLowerCase() || "bin";
    const objectName = `prizes/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const file = bucketPublic.file(objectName);

    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 5 * 60 * 1000,
      contentType,
    });

    const publicUrl = `https://storage.googleapis.com/${bucketPublic.name}/${objectName}`;

    res.json({ url, objectName, publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generando signed upload URL" });
  }
};
export const activityCloud = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { filename, contentType } = req.body;

    const ext = filename.split(".").pop()?.toLowerCase() || "bin";
    const objectName = `activity/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const file = bucketPublic.file(objectName);

    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 5 * 60 * 1000,
      contentType,
    });

    const publicUrl = `https://storage.googleapis.com/${bucketPublic.name}/${objectName}`;

    res.json({ url, objectName, publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generando signed upload URL" });
  }
};

export const redemptionsUpload = async (
  req: AuthRequestFile,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { filename, contentType } = req.body;
    if (!filename || !contentType) next();
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
  req: AuthRequestFile,
  res: Response,
): Promise<void> => {
  try {
    const { filename, contentType } = req.body;
    if (!filename || !contentType) {
      res.status(404).json({ message: "imagen no encontrada" });
      return;
    }
    const ext = filename.split(".").pop()?.toLowerCase() || "bin";
    const objectName = `agreements/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const file = bucketPublic.file(objectName);

    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 5 * 60 * 1000,
      contentType,
    });

    const publicUrl = `https://storage.googleapis.com/${bucketPublic.name}/${objectName}`;

    res.json({ url, objectName, publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generando signed upload URL" });
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

export const deleteAgreementImage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agreement = await Agreement.findByPk(String(req.params.id));

    if (!agreement) {
      return res.status(404).json({ message: "Agreement no encontrado" });
    }

    const image = agreement.dataValues.image;

    if (!image) return next();

    let objectName = image;

    if (image.startsWith("https://storage.googleapis.com/")) {
      const url = new URL(image);
      objectName = decodeURIComponent(
        url.pathname.replace(`/${bucketPublic.name}/`, ""),
      );
    }

    await bucketPublic.file(objectName).delete();

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error eliminando imagen del bucket" });
  }
};
