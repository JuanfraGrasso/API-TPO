import { Router } from "express";
import { createInquiryController } from "../controllers/inquiriesController.js";

const inquiriesRouter = Router();

inquiriesRouter.post("/inquiries", createInquiryController);

export { inquiriesRouter };