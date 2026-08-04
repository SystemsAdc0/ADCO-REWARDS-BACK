import { NextFunction, Response } from "express";
import { AuthRequest, JwtPayload } from "../types";
import jwt from "jsonwebtoken";

export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    req.user = decoded;

    next();
  } catch {
    next();
  }
};
