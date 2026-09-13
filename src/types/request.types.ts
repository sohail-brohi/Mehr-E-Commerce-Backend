import type { Request } from "express";
import type { TokenPayload } from "../helpers/jwt.helper.js";

export type AuthedRequest = Request & {
  user?: TokenPayload;
  guestId?: string;
  clientIp?: string;
};
