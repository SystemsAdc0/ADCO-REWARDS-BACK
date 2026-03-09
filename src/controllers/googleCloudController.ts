import crypto from "crypto";
import { Request, Response } from "express";
import { Storage } from "@google-cloud/storage";
import { AuthRequest } from "../types";

const storage = new Storage({
  credentials: JSON.parse(process.env.GCP_KEY as string),
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME as string);

export const googleCloudCtr = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { filename, contentType } = req.body as {
      filename?: string;
      contentType?: string;
    };

    if (!filename || !contentType) {
      res
        .status(400)
        .json({ message: "filename y contentType son requeridos" });
      return;
    }

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
export const prizeCloud = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { filename, contentType } = req.body as {
      filename?: string;
      contentType?: string;
    };

    if (!filename || !contentType) {
      res
        .status(400)
        .json({ message: "filename y contentType son requeridos" });
      return;
    }

    const ext = filename.split(".").pop()?.toLowerCase() || "bin";
    const objectName = `prizes/${Date.now()}-${crypto.randomUUID()}.${ext}`;

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
export const googleActivityPost = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { filename, contentType } = req.body as {
      filename?: string;
      contentType?: string;
    };

    if (!filename || !contentType) {
      res
        .status(400)
        .json({ message: "filename y contentType son requeridos" });
      return;
    }

    const ext = filename.split(".").pop()?.toLowerCase() || "bin";
    const objectName = `posts/${Date.now()}-${crypto.randomUUID()}.${ext}`;

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
  const file = bucket.file(req.body.objectName);
  const [url] = await file.getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + 2 * 60 * 1000,
  });
  res.json({ url });
};
// app.post("/files/download", async (req, res) => {

//   const file = bucket.file(req.body.objectName);

//   const [url] = await file.getSignedUrl({
//     version: "v4",
//     action: "read",
//     expires: Date.now() + 2 * 60 * 1000
//   });

//   res.json({ url });
// });

// window.open(data.url);
