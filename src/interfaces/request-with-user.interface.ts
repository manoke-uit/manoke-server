// src/@types/express/index.d.ts
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    adminSecret?: string;
  }
}