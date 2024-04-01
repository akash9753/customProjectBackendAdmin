import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import { v4 as uuidv4 } from "uuid";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { UserService } from "./userService";
import { UploadedFile } from "express-fileupload";
import { User } from "./userTypes";
import { FileStorage } from "../common/types/storage";

export class UserController {
    constructor(
        private userService: UserService,
        private storage: FileStorage,
    ) {}

    create = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        // console.log(req.body);
        let imageName = "";
        if(req.files && req.files.profileImage){
            const image = req.files.profileImage as UploadedFile;
            imageName = uuidv4();
    
            await this.storage.upload({
                filename: imageName,
                fileData: image.data.buffer,
            });
        }
        
        // console.log(image);

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
            role
        } = req.body;

        const user: User = {
            firstName,
            lastName,
            email,
            mobile: mobile || "",
            password,
            confirmPassword,
            profileImage: imageName || "",
            city: city || "",
            country: country || "",
            address:address || [],
            role
        };
        
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (req.body.address) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const address = JSON.parse(req.body.address as string);
            user.address = address;
        }


        // console.log(`userController`, user);
        const newUser = await this.userService.createUser(
            user as unknown as User,
        );

        res.json({ id: newUser._id });
    };

    getAllUsers = async(req: Request,res: Response)=>{
        const users = await this.userService.getAllUsers();
        const total = users.length;
        res.json({status:true, total:total,data:users})
    }
}
