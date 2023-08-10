import { Group } from "../models";
import { minioClient } from "../utils/minio-client";

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
                if (err) {
                    throw (err);
                }
            });
        }
    }

    // delete source file
    private async deleteFile(fileName, groupId, callback) {
        const group: any = await Group.findById({_id: groupId}).select('_workspace').lean();

        const finalpath = `${fileName}`
        
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