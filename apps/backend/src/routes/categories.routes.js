import { Router } from "express";
import {
	createCategoryController,
	deleteCategoryController,
	listCategoriesController,
	updateCategoryController
} from "../controllers/categoriesController.js";
import { requireAdminAuth } from "../utils/adminAuth.js";

const categoriesRouter = Router();

categoriesRouter.get("/categories", listCategoriesController);
categoriesRouter.post("/categories", requireAdminAuth, createCategoryController);
categoriesRouter.put("/categories/:id", requireAdminAuth, updateCategoryController);
categoriesRouter.delete("/categories/:id", requireAdminAuth, deleteCategoryController);

export { categoriesRouter };
