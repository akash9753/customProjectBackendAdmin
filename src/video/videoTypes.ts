import mongoose from "mongoose";

export interface Video{
    _id?: mongoose.Types.ObjectId;
    title: string,
    category:string,
    description:string,
    tags?:string[],
    videoFile:string,
    isPublished:string,
    uploadedBy: mongoose.Types.ObjectId;
}

export interface Filter {
    category?: string;
    uploadedBy?: mongoose.Types.ObjectId;
    isPublished?: string;
}

export interface PaginateQuery {
    page: number;
    limit: number;
}