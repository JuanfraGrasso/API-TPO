import { Router } from "express";
import {
  createPublicationController,
  deletePublicationController,
  listPublicationsController,
  updatePublicationController
} from "../controllers/publicationsController.js";
import { requireAdminAuth } from "../utils/adminAuth.js";

const publicationsRouter = Router();

publicationsRouter.get("/publications", listPublicationsController);
publicationsRouter.post("/publications", requireAdminAuth, createPublicationController);
publicationsRouter.put("/publications/:id", requireAdminAuth, updatePublicationController);
publicationsRouter.delete("/publications/:id", requireAdminAuth, deletePublicationController);

export { publicationsRouter };
