import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { Storage } from "@google-cloud/storage";
import { AuthRequest, AuthRequestFile } from "../types";

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
