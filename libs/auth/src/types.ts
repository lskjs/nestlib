import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';

export interface User {
  _id?: string;
  email: string;
  role: string;
  password: string;
  companyId: string;
}

export type UserDto = {
  email: string;
  password?: string;
  passwordHash?: string;
};

export interface Session {
  _id?: string;
  user: User;
}

export interface SessionData {
  id?: string;
  user?: Partial<User>;
  regenerate(any: any): void;
  save(any: any): void;
}

export type Request = ExpressRequest & { session: any };
export type Response = ExpressResponse;

// export interface Request extends ExpressRequest {
//   session: SessionData; // & Express.Session;
// }
