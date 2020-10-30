const fs = require('fs');

export class FilesService {

    constructor(){
        
    }

    /**
     * This function is responsible for deleting an attached file
     * @param fileName
     */
    async deleteAttachedFiles(fileName: string) {

        if (fileName) {

            //delete files, this catches both document insertion as well as multiple file attachment deletes
            this.deleteFile(fileName, (err) => {
                if (err) { throw (err); }
                //all files removed);
                });
        }
    }

    // delete source file
    private deleteFile(fileName, callback) {
        const finalpath = `${process.env.FILE_UPLOAD_FOLDER}${fileName}`
        fs.unlink(finalpath, function (err) {
            if (err) {
                callback(err);
                return;
            } else {
                callback(null);
            }
        });
    }
}