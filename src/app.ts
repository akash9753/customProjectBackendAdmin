import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler";
import authRouter from "./auth/authRouter"
import userRouter from "./user/userRouter";
import uploadRouter from "./video/uploadRouter";

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
    res.json({ message: "custom project ............." });
});

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/video", uploadRouter);




app.use(globalErrorHandler);

export default app;
