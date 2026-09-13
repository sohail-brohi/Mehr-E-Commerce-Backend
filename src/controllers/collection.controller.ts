import type { Request, Response } from "express";
import * as collectionService from "../services/collection.service.js";

export async function list(_req: Request, res: Response) {
  res.json(await collectionService.listCollections());
}

export async function create(req: Request, res: Response) {
  res.status(201).json(await collectionService.createCollection(req.body ?? {}));
}

export async function update(req: Request, res: Response) {
  res.json(await collectionService.updateCollection(req.params.id, req.body ?? {}));
}

export async function remove(req: Request, res: Response) {
  res.json(await collectionService.deleteCollection(req.params.id));
}
