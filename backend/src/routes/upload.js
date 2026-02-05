import express from "express";
import multer from "multer";
import {
  uploadFile,
  getUploadJobStatus,
  listUploads,
  mapColumns,
} from "../controllers/uploadController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateFileUpload } from "../middleware/validation.js";

const router = express.Router();

const upload = multer({
  dest: "./uploads",
  limits: {
    fileSize: process.env.MAX_FILE_SIZE || 52428800,
  },
});
router.use(authenticate);
router.post(
  "/",
  authorize("upload"),
  upload.single("file"),
  validateFileUpload,
  uploadFile,
);
router.get("/:jobId", getUploadJobStatus);
router.get("/", listUploads);
router.post("/:jobId/map-columns", mapColumns);

export default router;
