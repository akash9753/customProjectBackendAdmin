// import { paginationLabels } from "../config/pagination";
import videoModel from "./videoModel";
import { Filter, Video } from "./videoTypes";


export class UploadService  {
    
    async upload(video:Video){
        const createdVideo = await videoModel.create(video);
        return createdVideo;
    }

    async getVideos(
        q: string,
        filters: Filter,
        tags: string[]
    ) {
        const searchQueryRegexp = new RegExp(q, "i");

        const matchQuery = {
            ...filters,
            title: searchQueryRegexp,
            tags: { $in: tags } 
        };
         
        const aggregate = videoModel.aggregate([
            {
                $match: matchQuery,
            },
        ]);

        const res = await aggregate.exec();
        return res as Video[];
    }
}