import { Router } from "express";
import { listCategoriesController } from "../controllers/categoriesController.js";

const categoriesRouter = Router();

categoriesRouter.get("/categories", listCategoriesController);

export { categoriesRouter };
