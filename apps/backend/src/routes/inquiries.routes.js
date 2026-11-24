import { Router } from "express";
import {
  createInquiryController,
  createInquiryCommentController,
  deleteInquiryController,
  listInquiryCommentsController,
  listInquiriesController,
  updateInquiryStatusController
} from "../controllers/inquiriesController.js";
import { requireAdminAuth } from "../utils/adminAuth.js";

const inquiriesRouter = Router();

inquiriesRouter.post("/inquiries", createInquiryController);
inquiriesRouter.get("/inquiries", requireAdminAuth, listInquiriesController);
inquiriesRouter.get("/inquiries/:id/comments", requireAdminAuth, listInquiryCommentsController);
inquiriesRouter.post("/inquiries/:id/comments", requireAdminAuth, createInquiryCommentController);
inquiriesRouter.patch("/inquiries/:id", requireAdminAuth, updateInquiryStatusController);
inquiriesRouter.delete("/inquiries/:id", requireAdminAuth, deleteInquiryController);

export { inquiriesRouter };