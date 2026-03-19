import { AuthRequest, AuthRequestFile } from "../types/index";
import { Response } from "express";
import Agreement from "../models/Agreement";
export const getAgreement = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const agreements = await Agreement.findAll({
      attributes: {
        exclude: req.user?.role === "admin" ? [] : ["description", "page"],
      },
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
    const agreements = await Agreement.findByPk(String(req.params.id));
    res.status(200).json(agreements);
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
    await agreement.update(req.body);
    return res.json(agreement);
  } catch (err) {}
};

export const createAgreement = async (req: AuthRequestFile, res: Response) => {
  try {
    const agreement = await Agreement.create(req.body);
    res.status(201).json(agreement);
  } catch (err) {
    console.log(err);

    res.status(500).json({ message: "Error", error: err });
  }
};

export const deleteAgreement = async (req: AuthRequest, res: Response) => {
  try {
    const agreement = await Agreement.findByPk(String(req.params.id));
    if (agreement) agreement.destroy();
    res.status(201).json(agreement);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};
