import { Router } from "express";
import { healthRouter } from "./health.routes.js";
import { publicationsRouter } from "./publications.routes.js";

const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(publicationsRouter);

export { apiRouter };
