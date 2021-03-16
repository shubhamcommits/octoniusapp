import { File, Folder } from '../models';
import { Readable } from 'stream';
import { FilesService } from '.';

// Create instance of files service
let filesService = new FilesService();

export class FoldersService {

    // Select User Fields on population
    userFields: any = 'first_name last_name profile_pic role email';

    // Select Group Fileds on population
    groupFields: any = 'group_name group_avatar workspace_name';

    // Select File Fileds on population
    fileFields: any = 'original_name modified_name type mime_type created_date _posted_by _group';

    constructor() { }

    /**
     * This function is used to populate a folder with all the possible properties
     * @param folder
     */
    async populateFolderProperties(folder: any) {

        // Populate folder properties
        folder = await Folder.populate(folder, [
            { path: '_group', select: this.groupFields },
            { path: '_posted_by', select: this.userFields }
        ])

        // Return folder with populated properties
        return folder
    }

    /**
     * This function is responsible for adding a new folder
     * @param folderData 
     */
    async add(folderData: any) {

        // Prepare Folder Data
        let folder: any = {
            folder_name: folderData.folder_name,
            _group: folderData._group,
            _created_by: folderData._created_by,
            _parent: folderData._parent
        }

        // Create the new Folder
        folder = await Folder.create(folder);

        // Return folder
        return folder
    }

    /**
     * This function is responsible for removing a folder and its related folders
     * @param folderId 
     */
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
            });

            // Find all the files 
            let filesStream = Readable.from(await File.find({
                _folder: folderId
            }).select('_id'));

            // Delete all the folders present in a folder
            filesStream.on('data', async (file) => {
                //await File.findByIdAndRemove(file._id)
                await filesService.delete(file._id)
            });

            // Search for subfolders
            const numSubFolders = await Folder.find({
                _parent: folderId
            }).countDocuments();

            // Remove subfolders
            if (numSubFolders > 0) {
                let foldersStream = Readable.from(await Folder.find({
                    _parent: folderId
                }).select('_id'));
    
                // Delete all the folders present in a folder
                foldersStream.on('data', async (folder) => {
                    await this.remove(folder._id)
                });
            }

            // Return the deleted folder
            return folder;
        }

    }

    /**
     * This function is responsible for fetching all folders of a group
     * @param groupId 
     */
    async get(groupId: string, folderId?: string) {

        let folders: any = []

        // Fetch folders on the basis of the params @lastPostId
        let query = {};
        if (folderId) {
            query = {
                _group: groupId,
                _parent: folderId
            };
        } else {
            query = {
                _group: groupId,
                _parent: { $eq: null }
            };   
        }

        folders = await Folder.find(query)
            .sort('folder_name')
            .populate([
                { path: '_group', select: this.groupFields },
                { path: '_posted_by', select: this.userFields }
            ])
            .lean();

        // Return all the folders with the populated properties
        return folders;
    }

    /**
     * This function is responsible for fetching all folders of a folder
     * @param folderId 
     */
    async getFolders(folderId: string) {

        let folders: any = []

        // Fetch folders on the basis of the params @lastPostId

        folders = await Folder.find({
            _parent: folderId
        })
            .sort('folder_name')
            .populate([
                { path: '_group', select: this.groupFields },
                { path: '_posted_by', select: this.userFields }
            ])
            .lean();

        // Return all the folders with the populated properties
        return folders;
    }

    /**
     * This function is responsible for fetching one folder
     * @param folderId 
     */
    async getOne(folderId: string) {

        let folder: any;

        // Fetch folders on the basis of the params @lastPostId

        folder = await Folder.findById({
            _id: folderId
        })
            .sort('folder_name')
            .lean();

        // Populate Folder Properties
        folder = this.populateFolderProperties(folder)

        // Return all the folders with the populated properties
        return folder;
    }

    /**
     * This function is responsible for editing folder name
     * @param folderId 
     * @param folderName
     */
    async edit(folderId: string, folderName: any) {

        if (folderId) {

            // Find the folder by Id
            let folder: any = await Folder.findByIdAndUpdate(folderId,
                {
                    $set: { folder_name: folderName }
                })

            // Populate File Properties
            folder = this.populateFolderProperties(folder)

            // Return folder
            return folder;
        }
    }
}