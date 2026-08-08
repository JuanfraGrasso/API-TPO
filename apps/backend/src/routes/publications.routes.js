import { Router } from "express";
import { listPublicationsController } from "../controllers/publicationsController.js";

const publicationsRouter = Router();

publicationsRouter.get("/publications", listPublicationsController);

export { publicationsRouter };
