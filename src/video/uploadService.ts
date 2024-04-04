
import { paginationLabels } from "../config/pagination";
import videoModel from "./videoModel";
import { Filter, PaginateQuery, Video } from "./videoTypes";


export class UploadService  {
    
    async upload(video:Video){
        const createdVideo = await videoModel.create(video);
        return createdVideo;
    }

    async getVideos(
        q: string,
        filters: Filter,
        paginateQuery: PaginateQuery,
    ) {
        const searchQueryRegexp = new RegExp(q, "i");
    
        // Define a type for the partial match query
        type PartialMatchQuery = Partial<{
            [K in keyof Filter]: 
                K extends 'category' | 'tags' | 'uploadedBy' ? { $in: Filter[K] } :
                K extends 'title' | 'isPublished' ? RegExp | string :
                Filter[K];
        }>;
        
        
        // Initialize an empty matchQuery object
        const matchQuery: PartialMatchQuery = {};
        // console.log(`MatchQuery`,typeof matchQuery);
        // Add fields to matchQuery if they are available in filters
        if (filters.title) {
            matchQuery.title = searchQueryRegexp;
        }
    
        if (filters.isPublished) {
            matchQuery.isPublished = filters.isPublished;
        }
    
        if (filters.category && filters.category.length > 0) {
            matchQuery.category = { $in: filters.category };
        }
    
        if (filters.tags && filters.tags.length > 0) {
            matchQuery.tags = { $in: filters.tags };
        }
    
        if (filters.uploadedBy && filters.uploadedBy.length > 0) {
            matchQuery.uploadedBy = { $in: filters.uploadedBy };
        }
    
        // console.log(`service match query`, matchQuery);
    
        // Perform aggregation
        const aggregate = videoModel.aggregate([
            {
                $match: matchQuery,
            },
            {
                $lookup: {
                    from: "users", // collection name
                    localField: "uploadedBy",
                    foreignField: "_id",
                    as: "user",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                firstName: 1,
                            },
                        },
                    ],
                },
            },
            {
                $unwind: "$user",
            },
        ]);
    
        // Perform pagination and return results
        return videoModel.aggregatePaginate(aggregate, {
            customLabels: paginationLabels,
            ...paginateQuery,
        });
    }
    
    
}