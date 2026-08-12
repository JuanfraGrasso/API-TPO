import { Router } from "express";
import { createInquiryController, listInquiriesController } from "../controllers/inquiriesController.js";
import { requireAdminAuth } from "../utils/adminAuth.js";

const inquiriesRouter = Router();

inquiriesRouter.post("/inquiries", createInquiryController);
inquiriesRouter.get("/inquiries", requireAdminAuth, listInquiriesController);

export { inquiriesRouter };