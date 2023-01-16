import { Group } from "../models";

const fs = require('fs');
const minio = require('minio');

export class FilesService {

    constructor(){
        
    }

    /**
     * This function is responsible for deleting an attached file
     * @param fileName
     */
    async deleteAttachedFiles(fileName: string, groupId: string) {

        if (fileName) {

            //delete files, this catches both document insertion as well as multiple file attachment deletes
            this.deleteFile(fileName, groupId, (err) => {
                if (err) { throw (err); }
                //all files removed);
                });
        }
    }

    // delete source file
    private async deleteFile(fileName, groupId, callback) {
        const group: any = await Group.findById({_id: groupId}).select('_workspace').lean();

        const finalpath = `${process.env.FILE_UPLOAD_FOLDER}${fileName}`
        // fs.unlink(finalpath, function (err) {
        //     if (err) {
        //         callback(err);
        //         return;
        //     } else {
        //         callback(null);
        //     }
        // });
        var minioClient = new minio.Client({
            endPoint: process.env.MINIO_DOMAIN,
            port: +(process.env.MINIO_API_PORT),
            useSSL: process.env.MINIO_PROTOCOL == 'https',
            accessKey: process.env.MINIO_ACCESS_KEY,
            secretKey: process.env.MINIO_SECRET_KEY
        });
        await minioClient.removeObject(group._workspace, finalpath, (error) => {
            if (error) {
                callback(error);
                return;
            } else {
                callback(null);
            }
        });
    }
}