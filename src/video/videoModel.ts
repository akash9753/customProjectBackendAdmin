
import { Video } from "./videoTypes";
import mongoose, {Schema, AggregatePaginateModel } from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";


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
},  
{ timestamps: true },
);

videoSchema.plugin(aggregatePaginate);
export default mongoose.model<Video, AggregatePaginateModel<Video>>(
    "Video",
    videoSchema,
);

// const Video = mongoose.model('Video', videoSchema);

// export default Video;