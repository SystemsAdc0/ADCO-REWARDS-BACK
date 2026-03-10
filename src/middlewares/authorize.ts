import { Response, NextFunction } from "express";
import { AuthRequest, UserRole } from "../types";

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({ message: "No autenticado" });
        return;
      }
      if (!roles.includes(req.user.role)) {
        console.log(roles, req.user.role);

        res
          .status(403)
          .json({ message: "Acceso denegado: permisos insuficientes" });
        return;
      }
      next();
    } catch (error) {
      console.log(error);
    }
  };
};
