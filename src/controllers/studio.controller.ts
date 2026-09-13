import type { Response } from "express";
import * as studioService from "../services/studio.service.js";
import type { AuthedRequest } from "../types/request.types.js";

export async function overview(_req: AuthedRequest, res: Response) {
  res.json(await studioService.getOverview());
}

export async function customers(_req: AuthedRequest, res: Response) {
  res.json(await studioService.listCustomers());
}

export async function updateRole(req: AuthedRequest, res: Response) {
  res.json(await studioService.updateCustomerRole(req.params.id, req.body?.role, req.user?.id));
}

export async function inbox(_req: AuthedRequest, res: Response) {
  res.json(await studioService.listInbox());
}

export async function markRead(req: AuthedRequest, res: Response) {
  res.json(await studioService.markInboxRead(req.params.id));
}

export async function removeInbox(req: AuthedRequest, res: Response) {
  res.json(await studioService.deleteInbox(req.params.id));
}

export async function subscribers(_req: AuthedRequest, res: Response) {
  res.json(await studioService.listSubscribers());
}

export async function settings(_req: AuthedRequest, res: Response) {
  res.json(await studioService.getSettings());
}

export async function updateSettings(req: AuthedRequest, res: Response) {
  res.json(await studioService.updateSettings(req.body ?? {}));
}
