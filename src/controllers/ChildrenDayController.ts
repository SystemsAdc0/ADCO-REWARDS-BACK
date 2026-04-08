import { ChildrenDay } from "../models";
import { AuthRequest } from "../types";
import { Response } from "express";
export const getParticipate = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const user = req.user?.id;
  try {
    if (!user) {
      res
        .status(500)
        .json({ message: "Error", error: "identificador no encontrado" });
      return;
    }
    const exist = await ChildrenDay.findOne({
      where: { user_id: user },
    });
    res.status(200).json({ exist: exist ? true : false });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};
