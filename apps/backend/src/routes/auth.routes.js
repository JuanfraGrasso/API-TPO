import { Router } from "express";
import {
  changePasswordController,
  listAdminsController,
  loginController,
  meController,
  registerController,
  resetAdminPasswordController,
  updateProfileController
} from "../controllers/authController.js";
import { requireAdminAuth } from "../utils/adminAuth.js";

const authRouter = Router();

authRouter.post("/auth/login", loginController);
authRouter.post("/auth/register", requireAdminAuth, registerController);
authRouter.get("/auth/me", requireAdminAuth, meController);
authRouter.get("/auth/admins", requireAdminAuth, listAdminsController);
authRouter.put("/auth/profile", requireAdminAuth, updateProfileController);
authRouter.put("/auth/password", requireAdminAuth, changePasswordController);
authRouter.put("/auth/admins/:id/password", requireAdminAuth, resetAdminPasswordController);

export { authRouter };