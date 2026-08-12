import { Router } from "express";
import { loginController, meController, registerController } from "../controllers/authController.js";
import { requireAdminAuth } from "../utils/adminAuth.js";

const authRouter = Router();

authRouter.post("/auth/login", loginController);
authRouter.post("/auth/register", registerController);
authRouter.get("/auth/me", requireAdminAuth, meController);

export { authRouter };