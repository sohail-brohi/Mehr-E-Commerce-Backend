import type { Response } from "express";
import * as authService from "../services/auth.service.js";
import type { AuthedRequest } from "../types/request.types.js";

export async function register(req: AuthedRequest, res: Response) {
  res.status(201).json(
    await authService.register({
      name: req.body?.name,
      email: req.body?.email,
      password: req.body?.password,
      phone: req.body?.phone,
      guestId: req.guestId,
    }),
  );
}

export async function login(req: AuthedRequest, res: Response) {
  res.json(
    await authService.login({
      email: req.body?.email,
      password: req.body?.password,
      guestId: req.guestId,
    }),
  );
}

export async function me(req: AuthedRequest, res: Response) {
  res.json(await authService.getMe(req.user!.id));
}

export async function updateMe(req: AuthedRequest, res: Response) {
  res.json(await authService.updateMe(req.user!.id, { name: req.body?.name, phone: req.body?.phone }));
}

export async function forgot(req: AuthedRequest, res: Response) {
  res.json(await authService.forgotPassword(req.body?.email));
}

export async function reset(req: AuthedRequest, res: Response) {
  res.json(await authService.resetPassword(req.body?.token, req.body?.password));
}
