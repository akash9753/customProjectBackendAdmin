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

    async findByEmail(email: string) {
        const user = await userModel.findOne({ email });
            return user;
    }

    async findById(id: string) {
        const user = await userModel.findOne({ _id: id }).lean();
            return user;
    }

    async getAllUsers(){
        const users = await userModel.find();
        return users;
    }
}