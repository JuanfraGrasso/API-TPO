import { Router } from "express";
import multer from "multer";
import { uploadImagesController } from "../controllers/uploadController.js";
import { requireAdminAuth } from "../utils/adminAuth.js";

const uploadRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 10
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos de imagen (JPEG, PNG, WEBP, etc.)"));
    }
  }
});

uploadRouter.post(
  "/upload",
  requireAdminAuth,
  upload.array("images", 10),
  uploadImagesController
);

export { uploadRouter };
