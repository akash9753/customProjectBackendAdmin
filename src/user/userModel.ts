import mongoose, { AggregatePaginateModel } from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
import { User } from "./userTypes";
const address = new mongoose.Schema({
    permanentAddress: {
        type: String,
    },
    temproryAddress: {
        type: String,
    },
});


const productSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        mobile: {
            type: String,
        },
        password: {
            type: String,
            required: true,
        },
        confirmPassword: {
            type: String,
            required: true,
        },
        profileImage: {
            type: String,
        },
        city: {
            type: String,
        },
        country: {
            type: String,
        },
        address: {
            type: [address],
            required: false, 
        },
        
    },
    { timestamps: true },
);
productSchema.plugin(aggregatePaginate);
export default mongoose.model<User, AggregatePaginateModel<User>>(
    "User",
    productSchema,
);
