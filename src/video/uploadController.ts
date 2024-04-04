import { NextFunction, Request, Response } from "express";
import { UploadService } from "./uploadService";
import { FileStorage } from "../common/types/storage";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { UploadedFile } from "express-fileupload";
import { Filter, Video } from "./videoTypes";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
export class UploadController {
    constructor(
        private uploadService: UploadService,
        private s3Storage: FileStorage,
    ) {}

    upload = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        // console.log(req.body);
        let videoKey = "";
        try {
            if (req.files && req.files.videoFile) {
                const vid = req.files.videoFile as UploadedFile;
                videoKey = uuidv4();

                await this.s3Storage.upload({
                    filename: videoKey,
                    fileData: vid.data.buffer,
                });
            }
        } catch (err) {
            return next(createHttpError(400, err as string));
        }

        // console.log(image);

        const { title, description, category, isPublished, uploadedBy } = req.body;

        const video: Video = {
            title,
            description,
            category,
            videoFile: videoKey,
            isPublished,
            uploadedBy
        };

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (req.body.tags) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const tags = JSON.parse(req.body.tags as string);
            video.tags = tags;
        }

        // console.log(`userController`, user);
        const newVideo = await this.uploadService.upload(
            video as unknown as Video,
        );

        return res.json({ status: "success", id: newVideo._id });
    };

    index = async (req: Request, res: Response) => {
        const { title, category, uploadedBy, isPublished, tags } = req.body;
         
        const filters: Filter = {};

        if (category && Array.isArray(category) && category.length > 0) {
            filters.category = category;
        }
    
        if (tags && Array.isArray(tags) && tags.length > 0) {
            filters.tags = tags;
        }
    
        if (uploadedBy && Array.isArray(uploadedBy) && uploadedBy.length > 0) {
            // Convert uploadedBy strings to mongoose.Types.ObjectId
            filters.uploadedBy = uploadedBy.map((id: string) => mongoose.Types.ObjectId.createFromHexString(id));
        }
    
        if (isPublished) {
            filters.isPublished = isPublished;
        }
        // console.log(`filters`,filters,title);
        
        const videos = await this.uploadService.getVideos(
            title as string,
            filters,
            {
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit
                    ? parseInt(req.query.limit as string)
                    : 10,
            },
        );

        const finalVideos = (videos.data as Video[]).map(
            (video: Video) => {
                return {
                    ...video,
                    image: this.s3Storage.getObjectUri(video.videoFile),
                };
            },
        );

        res.json({
            total: videos.total,
            pageSize: videos.limit,
            currentPage: videos.page,
            data: finalVideos,
            
        });


        // res.json(videos);
    }
}
