
import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { UserService } from "../user/userService";
import { User } from "../user/userTypes";
import { CredentialService } from "./credentialService";
import { TokenService } from "./tokenService";

export class AuthController {
    constructor(
        private userService: UserService,
        private tokenService: TokenService,
        private credentialService: CredentialService,
    ) {}

    register = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const {
            firstName,
            lastName,
            email,
            mobile,
            password,
            confirmPassword,
            city,
            country,
            address
        } = req.body;

        const existingUser = await this.userService.getUserByEmail(email as string);
        if (existingUser) {
            return next(createHttpError(400, "Email already exists"));
        }

        const user: User = {
            firstName,
            lastName,
            email,
            mobile: mobile || "",
            password,
            confirmPassword,
            profileImage:  "",
            city: city || "",
            country: country || "",
            address:address || [] 
        };
        
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (req.body.address) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const address = JSON.parse(req.body.address as string);
            user.address = address;
        }


        // console.log(`authController`, user);
        const newUser = await this.userService.createUser(
            user as unknown as User,
        );

        res.json({ id: newUser._id });
    };

    login = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
    };
}
