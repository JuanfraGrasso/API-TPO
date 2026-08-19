import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { categoriesRouter } from "./categories.routes.js";
import { healthRouter } from "./health.routes.js";
import { inquiriesRouter } from "./inquiries.routes.js";
import { publicationsRouter } from "./publications.routes.js";
import { uploadRouter } from "./upload.routes.js";

const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(authRouter);
apiRouter.use(categoriesRouter);
apiRouter.use(inquiriesRouter);
apiRouter.use(publicationsRouter);
apiRouter.use(uploadRouter);

export { apiRouter };
