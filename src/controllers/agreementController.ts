import { AuthRequest } from "../types/index";
import { Response } from "express";
import Agreement from "../models/Agreement";
import AgreementImage from "../models/AgreementImage";
import { Storage } from "@google-cloud/storage";

const storage = new Storage({
  credentials: JSON.parse(process.env.GCP_KEY as string),
});
const bucketPublic = storage.bucket(process.env.GCS_BUCKET_NAME_PUBLIC as string);

async function deleteObjectFromGCS(objectName: string) {
  if (!objectName) return;
  try {
    await bucketPublic.file(objectName).delete();
  } catch (err: any) {
    if (err?.code !== 404) console.error("GCS delete error:", err?.message);
  }
}

export const getAgreement = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const agreements = await Agreement.findAll({
      include: [{ model: AgreementImage, as: "images", order: [["position", "ASC"]] }],
    });
    res.status(200).json(agreements);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getAgreementByID = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const agreement = await Agreement.findByPk(String(req.params.id), {
      include: [{ model: AgreementImage, as: "images", order: [["position", "ASC"]] }],
    });
    res.status(200).json(agreement);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const updateAgreement = async (req: AuthRequest, res: Response) => {
  try {
    const agreement = await Agreement.findByPk(String(req.params.id));
    if (!agreement) {
      res.status(404).json({ message: "Convenio no encontrado" });
      return;
    }
    const { name, description, page, maps_url, logo, gallery } = req.body;
    await agreement.update({ name, description, page, maps_url });

    // Replace logo if a new one was provided
    if (logo?.url && logo?.objectName) {
      const oldLogo = await AgreementImage.findOne({
        where: { agreement_id: agreement.id, is_logo: true },
      });
      if (oldLogo) {
        await deleteObjectFromGCS(oldLogo.object_name);
        await oldLogo.destroy();
      }
      await AgreementImage.create({
        agreement_id: agreement.id,
        url: logo.url,
        object_name: logo.objectName,
        is_logo: true,
        position: 0,
      });
    }

    // Add new gallery images if provided
    if (Array.isArray(gallery) && gallery.length > 0) {
      const existingCount = await AgreementImage.count({
        where: { agreement_id: agreement.id, is_logo: false },
      });
      await AgreementImage.bulkCreate(
        gallery.map((img: { url: string; objectName: string }, i: number) => ({
          agreement_id: agreement.id,
          url: img.url,
          object_name: img.objectName,
          is_logo: false,
          position: existingCount + i,
        })),
      );
    }

    const updated = await Agreement.findByPk(agreement.id, {
      include: [{ model: AgreementImage, as: "images" }],
    });
    return res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error", error: err });
  }
};

export const createAgreement = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, page, maps_url, logo, gallery } = req.body;

    const agreement = await Agreement.create({ name, description, page, maps_url });

    const imagesToCreate: any[] = [];

    if (logo?.url && logo?.objectName) {
      imagesToCreate.push({
        agreement_id: agreement.id,
        url: logo.url,
        object_name: logo.objectName,
        is_logo: true,
        position: 0,
      });
    }

    if (Array.isArray(gallery) && gallery.length > 0) {
      gallery.forEach((img: { url: string; objectName: string }, i: number) => {
        imagesToCreate.push({
          agreement_id: agreement.id,
          url: img.url,
          object_name: img.objectName,
          is_logo: false,
          position: i,
        });
      });
    }

    if (imagesToCreate.length > 0) {
      await AgreementImage.bulkCreate(imagesToCreate);
    }

    const created = await Agreement.findByPk(agreement.id, {
      include: [{ model: AgreementImage, as: "images" }],
    });
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error", error: err });
  }
};

export const deleteAgreement = async (req: AuthRequest, res: Response) => {
  try {
    const agreement = await Agreement.findByPk(String(req.params.id), {
      include: [{ model: AgreementImage, as: "images" }],
    });
    if (!agreement) {
      res.status(404).json({ message: "Convenio no encontrado" });
      return;
    }

    const images = (agreement as any).images as AgreementImage[];
    await Promise.all(images.map((img) => deleteObjectFromGCS(img.object_name)));
    await AgreementImage.destroy({ where: { agreement_id: agreement.id } });
    await agreement.destroy();

    res.status(200).json({ message: "Convenio eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error", error: err });
  }
};

export const deleteAgreementImageById = async (req: AuthRequest, res: Response) => {
  try {
    const { imageId } = req.params;
    const image = await AgreementImage.findByPk(String(imageId));
    if (!image) {
      res.status(404).json({ message: "Imagen no encontrada" });
      return;
    }
    // Ensure the image belongs to the agreement
    if (String(image.agreement_id) !== String(req.params.id)) {
      res.status(403).json({ message: "Imagen no pertenece a este convenio" });
      return;
    }
    await deleteObjectFromGCS(image.object_name);
    await image.destroy();
    res.status(200).json({ message: "Imagen eliminada" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};
