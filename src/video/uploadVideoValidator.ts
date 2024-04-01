import { UploadedFile } from "express-fileupload";
import { body } from "express-validator";

export const uploadValidationRules = [
    body("title")
        .exists()
        .withMessage("Title is required")
        .notEmpty()
        .withMessage("Title cannot be empty")
        .isString()
        .withMessage("Title must be a string")
        .isLength({ min: 3, max: 50 })
        .withMessage("Title must be between 3 and 50 characters"),
    body("description")
        .exists()
        .withMessage("Description is required")
        .notEmpty()
        .withMessage("Description cannot be empty")
        .isString()
        .withMessage("Description must be a string")
        .isLength({ min: 10, max: 200 })
        .withMessage("Description must be between 10 and 200 characters"),
    body("category")
        .exists()
        .withMessage("Category is required")
        .notEmpty()
        .withMessage("Category cannot be empty")
        .isString()
        .withMessage("Category must be a string")
        .isLength({ min: 3, max: 30 })
        .withMessage("Category must be between 3 and 30 characters"),
    body("tags")
        .optional()
        .custom((value) => {
            if (typeof value !== "string") {
                throw new Error("Tags must be a string");
            }

            try {
                const tagsArray = JSON.parse(value);
                if (!Array.isArray(tagsArray)) {
                    throw new Error("Tags must be an array");
                }
            } catch (error) {
                throw new Error("Invalid JSON format for tags");
            }

            return true;
        }),

        body("videoFile").custom((value, { req }) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const video = req.files?.videoFile as UploadedFile;
            if (!video) {
                throw new Error("Video file is required");
            }
            const allowedFormats = ["video/mp4", "video/avi", "video/mpeg", "video/quicktime"];
            if (!allowedFormats.includes(video.mimetype)) {
                throw new Error("Only MP4, AVI, MPEG, and QuickTime formats are allowed for video files");
            }
            return true;
        }),
];
