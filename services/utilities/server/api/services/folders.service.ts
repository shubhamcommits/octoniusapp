import { Folder, File } from '../models';
import { Readable } from 'stream';

export class FoldersService {

    async add(folderData: any) {

        // Prepare Folder Data
        let folder: any = {
            folder_name: folderData.folder_name,
            _group: folderData._group,
            _created_by: folderData._created_by
        }

        // Create the new Folder
        folder = await Folder.create(folder);

        // Return folder
        return folder
    }

    async remove(folderId: string) {

        // Find the Folder
        let folder = await Folder.findById(folderId);

        // If Folder is not found
        if (!folder) {
            return new Error('Invalid folderId, please pass a valid one!');
        } else {

            // Remove the folder
            await Folder.findByIdAndRemove({
                _id: folderId
            })

            // Find all the files 
            let filesStream = Readable.from( await File.find({
                _folder: folderId
            }).select('id'))

            filesStream.on('data', async(file)=>{
                await File.findByIdAndRemove(file)
            })

            
        }

    }

}