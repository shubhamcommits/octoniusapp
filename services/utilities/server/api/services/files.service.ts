import { Folder, File } from '../models';
import { Readable } from 'stream';

export class FilesService {

    // Select User Fields on population
    userFields: any = 'first_name last_name profile_pic role email';

    // Select Group Fileds on population
    groupFields: any = 'group_name group_avatar workspace_name';

    // Select Folder Fields on population
    folderFileds: any = 'folder_name'

    /**
     * This function is responsible for adding a new file to the group
     * @param fileData 
     */
    async add(fileData: any) {

        // Preparing File Data
        let file: any = {
            _group: fileData._group,
            _posted_by: fileData._posted_by,
            original_name: fileData.original_name,
            modified_name: fileData.modified_name
        }

        // Create the new File
        file = await File.create(file);

        // Populate File Properties
        file = this.populateFileProperties(file)

        // Return file
        return file
    }

    /**
     * This function is responsible 
     * @param groupId 
     */
    async get(groupId: string, lastFileId?: string) {

        let files: any = []

        // Fetch files on the basis of the params @lastPostId
        if (lastFileId) {

            files = await File.find({
                $and: [
                    { _group: groupId },
                    { _id: { $lt: lastFileId } }
                ]
            })
                .sort('-_id')
                .limit(5)
                .populate([
                    { path: '_group', select: this.groupFields },
                    { path: '_posted_by', select: this.userFields }
                ])
                .lean();

        } else if (!lastFileId) {
            files = await File.find({
                _group: groupId
            })
                .sort('-_id')
                .limit(10)
                .populate([
                    { path: '_group', select: this.groupFields },
                    { path: '_posted_by', select: this.userFields }
                ])
                .lean();
        }

        // Return all the files with the populated properties
        return files;

    }

    /**
     * This function is used to populate a file with all the possible properties
     * @param file
     */
    async populateFileProperties(file: any) {

        // Populate file properties
        file = await File.populate(file, [
            { path: '_group', select: this.groupFields },
            { path: '_posted_by', select: this.userFields },
        ])

        // Return file with populated properties
        return file
    }

}