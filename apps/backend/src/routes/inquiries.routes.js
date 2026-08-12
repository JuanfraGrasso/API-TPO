import { Router } from "express";
import {
  createInquiryController,
  listInquiriesController,
  updateInquiryStatusController
} from "../controllers/inquiriesController.js";
import { requireAdminAuth } from "../utils/adminAuth.js";

const inquiriesRouter = Router();

inquiriesRouter.post("/inquiries", createInquiryController);
inquiriesRouter.get("/inquiries", requireAdminAuth, listInquiriesController);
inquiriesRouter.patch("/inquiries/:id", requireAdminAuth, updateInquiryStatusController);

export { inquiriesRouter };