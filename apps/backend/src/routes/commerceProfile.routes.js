import { Router } from "express";
import {
  getCommerceProfileController,
  updateCommerceProfileController
} from "../controllers/commerceProfileController.js";
import { requireAdminAuth } from "../utils/adminAuth.js";

const commerceProfileRouter = Router();

commerceProfileRouter.get("/commerce-profile", getCommerceProfileController);
commerceProfileRouter.put("/commerce-profile", requireAdminAuth, updateCommerceProfileController);

export { commerceProfileRouter };
