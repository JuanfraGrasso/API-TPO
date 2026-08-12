import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { healthRouter } from "./health.routes.js";
import { inquiriesRouter } from "./inquiries.routes.js";
import { publicationsRouter } from "./publications.routes.js";

const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(authRouter);
apiRouter.use(inquiriesRouter);
apiRouter.use(publicationsRouter);

export { apiRouter };
