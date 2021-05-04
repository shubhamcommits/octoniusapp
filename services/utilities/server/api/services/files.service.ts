import { Folder, File, Group, Flamingo } from '../models';
import { Readable } from 'stream';
import { FoldersService } from '.';
import http from 'axios';
import { Question } from '../models/questions.model';

export class FilesService {

    // Select User Fields on population
    userFields: any = 'first_name last_name profile_pic role email';

    // Select Group Fileds on population
    groupFields: any = 'group_name group_avatar workspace_name';

    // Select Folder Fields on population
    folderFields: any = 'folder_name';

    constructor() { }

    /**
     * This function is used to populate a file with all the possible properties
     * @param file
     */
    async populateFileProperties(file: any) {

        // Populate file properties
        file = await File.populate(file, [
            { path: '_group', select: this.groupFields },
            { path: '_posted_by', select: this.userFields },
            { path: '_folder', select: this.folderFields },
        ])

        // Return file with populated properties
        return file
    }

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
            modified_name: fileData.modified_name,
            type: fileData.type,
            mime_type: fileData.mime_type,
            _folder: (fileData._folder && fileData._folder != '') ? fileData._folder : null
        }

        // Create the new File
        file = await File.create(file);

        // Populate File Properties
        file = this.populateFileProperties(file);

        // Return file
        return file
    }

    /**
     * This function is responsible for fetching files details
     * @param fileId 
     */
    async getOne(fileId: string) {

        if (fileId) {

            // Find the file by Id
            let file: any = await File.findById(fileId)

            // Populate File Properties
            file = this.populateFileProperties(file)

            // Return file
            return file;
        }
    }

    /**
     * This function is responsible for editing files details
     * @param fileId 
     */
    async edit(fileId: string, fileData: any) {

        if (fileId) {

            // Find the file by Id
            let file: any = await File.findByIdAndUpdate(fileId,
                {
                    $set: fileData
                }, {
                new: true
            })

            // Populate File Properties
            file = this.populateFileProperties(file)

            // Return file
            return file;
        }
    }

    /**
     * This function is responsible 
     * @param groupId 
     */
    async get(groupId: string, folderId: string, lastFileId?: string) {

        let files: any = []

        let query = {};
        
        // Fetch files on the basis of the params @lastPostId
        if (lastFileId) {
            if (folderId) {
                query = {
                    $and: [
                        { _group: groupId },
                        { _folder: folderId },
                        { _id: { $lt: lastFileId } }
                    ]
                };
            } else {
                query = {
                    $and: [
                        { _group: groupId },
                        { _folder: { $eq: null }},
                        { _id: { $lt: lastFileId } }
                    ]
                };   
            }

            files = await File.find(query)
                .sort('-_id')
                .limit(5)
                .populate([
                    { path: '_group', select: this.groupFields },
                    { path: '_posted_by', select: this.userFields },
                    { path: '_folder', select: this.folderFields }
                ])
                .lean();

        } else {
            if (folderId) {
                query = {
                    $and: [
                        { _group: groupId },
                        { _folder: folderId }
                    ]
                };
            } else {
                query = {
                    $and: [
                        { _group: groupId },
                        { _folder: { $eq: null }}
                    ]
                };   
            }
            files = await File.find(query)
                .sort('-_id')
                .limit(10)
                .populate([
                    { path: '_group', select: this.groupFields },
                    { path: '_posted_by', select: this.userFields },
                    { path: '_folder', select: this.folderFields }
                ])
                .lean();
        }

        // Return all the files with the populated properties
        return files;

    }

    /**
     * This function is responsible for searching files inside of a group
     * @param groupId 
     * @param query 
     */
    async searchFiles(groupsIdArray, query: any) {

        // Files Array List
        let files: any = []

        // Fetch files on the basis of the params @lastPostId
        files = await File.find({
            _group: { "$in": groupsIdArray },
            original_name: { $regex: new RegExp(query, 'i') }
        })
            .sort('-_id')
            .limit(5)
            .populate([
                { path: '_group', select: this.groupFields },
                { path: '_posted_by', select: this.userFields }
            ])
            .lean();

        // Return Files
        return files;
    }

    /**
     * This function is responsible for deleting a file
     * @param fileId 
     */
    async delete(fileId: string, flamingoType?: boolean) {

        if (fileId) {

            // Find the file by Id
            let deletedFile: any = await File.findById({ _id: fileId });

            deletedFile = await this.populateFileProperties(deletedFile);

            // TODO - check if it is deleting the content of the folio


            // Remove flamingo in case of flamingo type
            if (flamingoType) {
                // Delete the flamingo
                let flamingo = await Flamingo.findOne({_file:fileId});
                flamingo = await Flamingo.populate(flamingo, [
                    { path: '_questions' }
                ]);

                if (flamingo) {
                    flamingo = await Flamingo.findByIdAndDelete({_id: flamingo._id});

                    // Delete the questions
                    flamingo._questions.forEach(async question => {
                        await Question.findByIdAndDelete({
                            _id: question._id || question
                        });
                    });
                }
            }

            await File.findByIdAndDelete(fileId);

            // Return file
            return deletedFile;
        }
    }

    async findGroupsShareFiles(groupId: string) {
        const groups = await Group.find({
            $and: [
                { share_files: true},
                { _id: { $ne: groupId} },
            ]
        }).select('_id');
        
        let groupsIds = [];
        groups.forEach(group => {
            groupsIds.push(group._id);
        });

        return groupsIds;
    }

    /**
     * This function is responsible for copying a folio to a group
     * @param fileId
     * @param groupId 
     */
    async copy(fileId: string, groupId: string, folderId?: string) {

        if (fileId) {

            // Find the folio by Id
            let oldFile: any = await File.findById(fileId).lean();

            let newFile = oldFile;
            delete newFile._id;
            newFile._group = groupId;

            if (folderId) {
                newFile._folder = folderId;
            } else {
                delete newFile._folder;
            }

            // Create new folio
            newFile = await File.create(newFile);

            // Populate File Properties
            newFile = this.populateFileProperties(newFile)

            if (newFile.type == 'folio') {
                // TODO - Copy the content
            }

            // Return file
            return newFile;
        }
    }

    /**
     * This function is responsible for moving a folio to a group
     * @param fileId
     * @param groupId 
     */
    async move(fileId: string, groupId: string, folderId?: string) {

        if (fileId) {
            // Find the file by Id
            let file: any = await File.findByIdAndUpdate(fileId,
                {
                    _group: groupId,
                    _folder: folderId
                });

            // Populate File Properties
            file = this.populateFileProperties(file)

            // Return file
            return file;
        }
    }

    /**
     * This function is responsible for copying a folio to a group
     * @param fileId
     * @param groupId 
     */
    async copyByFolder(folderId: string, groupId: string, newFolderId?: string) {

        if (folderId) {
            let newFiles = [];
            // Find the folio by Id
            let oldFiles: any = await File.find({ _folder: folderId }).lean();
            for (let i = 0 ; i < oldFiles.length; i++) {
                let newFile = oldFiles[i];
                delete newFile._id;
                newFile._group = groupId;
    
                if (newFolderId) {
                    newFile._folder = folderId;
                } else {
                    delete newFile._folder;
                }
    
                // Create new folio
                newFile = await File.create(newFile);
    
                // Populate File Properties
                newFile = this.populateFileProperties(newFile)
    
                if (newFile.type == 'folio') {
                    // TODO - Copy the content
                }

                newFiles.push(newFile);
            }

            // Return file
            return newFiles;
        }
    }

    /**
     * This function is responsible for moving a file to a folder
     * @param fileId
     * @param folderId 
     */
    async moveToFolder(fileId: string, folderId: string) {

        if (fileId) {
            let updateAction = {};
            if (folderId == 'root') {
                updateAction = {
                    _folder: null
                };
            } else {
                updateAction = {
                    _folder: folderId
                };
            }

            // Find the file by Id
            let file: any = await File.findByIdAndUpdate(fileId, updateAction);

            // Populate File Properties
            file = this.populateFileProperties(file)

            // Return file
            return file;
        }
    }
}