
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
        // console.log(`service search query`,q);
        // console.log(`service filter`,filters);
        // console.log(`paginateQuery`,paginateQuery);
        
        const searchQueryRegexp = new RegExp(q, "i");
    
        // Define a type for the partial match query
        type PartialMatchQuery = Partial<{
            [K in keyof Filter]: 
                K extends 'category' | 'tags' | 'uploadedBy' ? { $in: Filter[K] } :
                K extends 'title' | 'isPublished' ? RegExp | string :
                K extends 'createdAt' ? { $gte: Date; $lte: Date } :
                 Filter[K];
        }>;
        
        
        // Initialize an empty matchQuery object
        const matchQuery: PartialMatchQuery = {title:searchQueryRegexp};
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

        if (filters.createdAt) {
            matchQuery.createdAt = {
                $gte: filters.createdAt.start,
                $lte: filters.createdAt.end,
            };
        }
    
        // console.log(`service match query`, matchQuery);
        // service match query {
        //     createdAt: { '$gte': '2024-04-06T00:00:00Z', '$lte': '2024-04-06T23:59:59Z' }
        //   }
    
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