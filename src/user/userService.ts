import userModel from "./userModel";
import {  User } from "./userTypes";

export class UserService {
    async createUser(user: User) {
        // console.log(`userService`,user);
        
        return (await userModel.create(user)) as User;
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return await userModel.findOne({ email }).exec();
    }

    
}