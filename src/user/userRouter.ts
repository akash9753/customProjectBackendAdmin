import express from "express";
import fileUpload from "express-fileupload";
import { asyncWrapper } from "../common/utils/wrapper";
import { UserController } from "./userController";
import createUserValidator from "./createUserValidator";
import { UserService } from "./userService";
import { S3Storage } from "../common/services/S3Storage";
import createHttpError from "http-errors";
import authenticate from "../common/middlewares/authenticate";

const router = express.Router();

const userService = new UserService();
const s3Storage = new S3Storage();
const userController = new UserController(userService, s3Storage);

router.post(
    "/create",
    fileUpload({
        limits: { fileSize: 50000 * 1024 }, // 500kb
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(400, "File size exceeds the limit");
            next(error);
        },
    }),
    authenticate,
    createUserValidator,
    asyncWrapper(userController.create),
);


router.get("/getAllUsers",authenticate,asyncWrapper(userController.getAllUsers))


export default router;
