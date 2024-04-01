
import { Video } from "./videoTypes";
import mongoose, {Schema } from "mongoose";



const videoSchema = new Schema<Video>({
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String },
    tags: { type: [String], default: [] },
    videoFile: { type: String, required: true },
    isPublished: { type: String, required: true },
    uploadedBy: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
     },
});


const Video = mongoose.model('Video', videoSchema);

export default Video;