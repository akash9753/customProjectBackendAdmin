import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"
import createHttpError from "http-errors";
import { AuthRequest } from "../../auth/types";
import config from "config";


const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token: string = req.headers.authorization?.split(" ")[1] || req.cookies.accessToken;

        if (!token) {
            throw new createHttpError.Unauthorized("Missing token");
        }

        const decoded = jwt.verify(token, config.get("secret.secretkey")) as JwtPayload;

        // Attach the decoded token data to the request object
        (req as AuthRequest).auth = {
            sub: decoded.sub || '',
            role: decoded.role,
            id: decoded.id
        };

        next();
    } catch (error) {
        // Pass the error to the next middleware
        next(error);
    }
};

export default authenticate;
