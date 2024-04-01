import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { UserService } from "../user/userService";
import { User } from "../user/userTypes";
import { CredentialService } from "./credentialService";
import { TokenService } from "./tokenService";
import bcrypt from "bcrypt";
import { JwtPayload } from "jsonwebtoken";
import { Roles } from "../common/constants";

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
            address,
        } = req.body;

        const existingUser = await this.userService.getUserByEmail(
            email as string,
        );
        if (existingUser) {
            return next(createHttpError(400, "Email already exists"));
        }

        const passwordString: string = password as string;
        const hashedPassword = await bcrypt.hash(passwordString, 10);

        const confirmPasswordString: string = confirmPassword as string;
        const hashedconfirmPassword = await bcrypt.hash(
            confirmPasswordString,
            10,
        );

        const user: User = {
            firstName,
            lastName,
            email,
            mobile: mobile || "",
            password: hashedPassword,
            confirmPassword: hashedconfirmPassword,
            profileImage: "",
            city: city || "",
            country: country || "",
            address: address || [],
            role:Roles.SUPER_ADMIN
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
        const { email, password } = req.body;

        const emailString: string = email as string;
        const passwordString: string = password as string;

        const user = await this.userService.findByEmail(emailString);
        if (!user) {
            const error = createHttpError(
                400,
                "Email or password does not match.",
            );
            next(error);
            return;
        }
        // console.log(user);

        const passwordMatch = await this.credentialService.comparePassword(
            passwordString,
            user.password,
        );

        if (!passwordMatch) {
            const error = createHttpError(
                400,
                "Email or password does not match.",
            );
            next(error);
            return;
        }

        // console.log("user",user);

        const payload: JwtPayload = {
            sub: String(user._id),
            role: "admin",
        };
        // console.log(`payload`,payload);

        const accessToken = this.tokenService.generateAccessToken(payload);

        res.cookie("accessToken", accessToken, {
            domain: "localhost",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60, // 1h
            httpOnly: true, // Very important
        });

        res.json({ status: "success" });
    };

    self = async(req: Request, res: Response) =>{
        // console.log(req.auth);
        
        if (!req.auth || typeof req.auth.sub !== 'string') {
            return res.status(401).json({ message: "Unauthorized" });
        }


        const user = await this.userService.findById(req.auth.sub);
        const data = {...user, password: undefined, confirmPassword:undefined }
        res.json({status:true, data:data});
    }
}
