import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  userId: number;
  roleId: number;
}

const getJwtSecret = () => {
  return process.env.JWT_SECRET || 'fallback-secret-key-for-development-only';
};

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: '1d',
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, getJwtSecret()) as JwtPayload;
};
