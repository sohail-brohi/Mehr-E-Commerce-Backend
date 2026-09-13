import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export type TokenPayload = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "customer";
};

export function signToken(payload: TokenPayload) {
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.jwtSecret, options);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtSecret) as TokenPayload;
}
