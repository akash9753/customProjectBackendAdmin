import mongoose from "mongoose";

export interface User {
    _id?: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    mobile:string;
    password: string;
    confirmPassword: string;
    profileImage: string;
    address?: [];
    city:string;
    country:string;
}