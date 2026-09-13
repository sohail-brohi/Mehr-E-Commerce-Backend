import type { Request, Response } from "express";
import * as productService from "../services/product.service.js";

export async function listPublished(_req: Request, res: Response) {
  res.json(await productService.listPublished());
}

export async function listAll(_req: Request, res: Response) {
  res.json(await productService.listAll());
}

export async function create(req: Request, res: Response) {
  res.status(201).json(await productService.createProduct(req.body ?? {}));
}

export async function update(req: Request, res: Response) {
  res.json(await productService.updateProduct(req.params.id, req.body ?? {}));
}

export async function patch(req: Request, res: Response) {
  res.json(await productService.patchProduct(req.params.id, req.body ?? {}));
}

export async function remove(req: Request, res: Response) {
  res.json(await productService.deleteProduct(req.params.id));
}
