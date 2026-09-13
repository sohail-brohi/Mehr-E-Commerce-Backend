import type { Request, Response } from "express";
import * as siteService from "../services/site.service.js";

export async function payTo(_req: Request, res: Response) {
  res.json(await siteService.getPublicPayTo());
}

export async function contact(req: Request, res: Response) {
  res.json(
    await siteService.submitContact({
      name: req.body?.name,
      email: req.body?.email,
      message: req.body?.message,
    }),
  );
}

export async function newsletter(req: Request, res: Response) {
  res.json(await siteService.subscribe(req.body?.email));
}
