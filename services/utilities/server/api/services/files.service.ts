import { Folder, File } from '../models';
import { Readable } from 'stream';

export class FilesService {

    /**
     * This function is responsible for adding a new file to the group
     * @param fileData 
     */
    async add(fileData: any) {

        // Preparing File Data
        let file: any = {
            _group: fileData._group,
            _created_by: fileData._created_by,
            original_name: fileData.original_name,
            modified_name: fileData.modified_name
        }

        // Create the new File
        file = await File.create(file);

        // Return file
        return file
    }

}