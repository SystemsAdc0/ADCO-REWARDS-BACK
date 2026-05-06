import { Request } from "express";

export type UserRole = "admin" | "moderator" | "user" | "visitor" | "developer";

export interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
export interface UploadedFile {
  url: string;
  objectName: string;
  publicUrl: string;
}

export interface AuthRequestFile extends Request {
  uploadedFile?: UploadedFile;
  user?: JwtPayload;
}

export type RedemptionStatus =
  | "pending"
  | "approved"
  | "delivered"
  | "rejected";
export type ActivityEntryStatus = "pending" | "approved" | "rejected";
export type ActivityStatus = "active" | "inactive" | "finished";
export type PrizeStatus = "active" | "inactive";
export type UserStatus = "active" | "inactive";
export type ActivityAnswerStatus = "pending" | "approved" | "rejected";
