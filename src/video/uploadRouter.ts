import express from "express";
import authenticate from "../common/middlewares/authenticate";
import { UploadController } from "./uploadController";
import { UploadService } from "./uploadService";
import { S3Storage } from "../common/services/S3Storage";
import fileUpload from "express-fileupload";
import createHttpError from "http-errors";
import { uploadValidationRules } from "./uploadVideoValidator";

const router = express.Router();

const uploadService = new UploadService();
const s3Storage = new S3Storage();

const uploadController = new UploadController(uploadService, s3Storage);

router.post(
    "/upload",
    fileUpload({
        limits: { fileSize: 50000 * 1024 }, // 500kb
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(400, "File size exceeds the limit");
            next(error);
        },
    }),
    authenticate,
    uploadValidationRules,
    uploadController.upload,
);

router.get("/",authenticate,uploadController.index)

export default router;
