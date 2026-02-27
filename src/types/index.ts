import { Request } from 'express';

export type UserRole = 'admin' | 'moderator' | 'user' | 'visitor';

export interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export type RedemptionStatus = 'pending' | 'approved' | 'delivered' | 'rejected';
export type ActivityEntryStatus = 'pending' | 'approved' | 'rejected';
export type ActivityStatus = 'active' | 'inactive' | 'finished';
export type PrizeStatus = 'active' | 'inactive';
export type UserStatus = 'active' | 'inactive';
