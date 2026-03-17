import { AuthRequest } from "../types/index";
import { Response } from "express";
import Agreement from "../models/Agreement";
export const getAgreement = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  console.log("aaaaaa");

  try {
    const agreements = await Agreement.findAll();
    res.status(200).json(agreements);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};
