import { Group, Post } from "../models";

const fs = require('fs');
const minio = require('minio');

export class FilesService {

    constructor(){
        
    }

    /**
     * This function is responsible for deleting an attached file
     * @param fileName
     */
    async deleteAttachedFiles(fileName: string, postId: string) {

        if (fileName) {
            //delete files, this catches both document insertion as well as multiple file attachment deletes
            const post: any = await Post.findById({ _id: postId })
                .populate({ path: '_group', select: '_workspace' })
                .lean();
            // const group: any = await Group.findById({_id: groupId}).select('_workspace').lean();

            const finalpath = `${fileName}`

            var minioClient = new minio.Client({
                endPoint: process.env.MINIO_DOMAIN,
                port: +(process.env.MINIO_API_PORT),
                useSSL: process.env.MINIO_PROTOCOL == 'https',
                accessKey: process.env.MINIO_ACCESS_KEY,
                secretKey: process.env.MINIO_SECRET_KEY
            });
            await minioClient.removeObject(((post._group._workspace._id || post._group._workspace)+'').toLocaleLowerCase(), finalpath, (error) => {
                if (error) {
                    throw (error);
                }
            });
        }
    }
}