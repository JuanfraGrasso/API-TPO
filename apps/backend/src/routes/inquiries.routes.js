import { Router } from "express";
import {
  createInquiryController,
  deleteInquiryController,
  listInquiriesController,
  updateInquiryStatusController
} from "../controllers/inquiriesController.js";
import { requireAdminAuth } from "../utils/adminAuth.js";

const inquiriesRouter = Router();

inquiriesRouter.post("/inquiries", createInquiryController);
inquiriesRouter.get("/inquiries", requireAdminAuth, listInquiriesController);
inquiriesRouter.patch("/inquiries/:id", requireAdminAuth, updateInquiryStatusController);
inquiriesRouter.delete("/inquiries/:id", requireAdminAuth, deleteInquiryController);

export { inquiriesRouter };