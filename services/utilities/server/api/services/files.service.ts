import moment from 'moment';
import { DateTime } from 'luxon';
import { File, Group, Flamingo } from '../models';
import { Question } from '../models/questions.model';

export class FilesService {

    // Select User Fields on population
    userFields: any = 'first_name last_name profile_pic role email';

    // Select Group Fileds on population
    groupFields: any = 'group_name group_avatar workspace_name files_for_admins enabled_rights rags _admins';

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
            { path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' },
            { path: 'approval_history._actor', select: '_id first_name last_name profile_pic' },
            { path: 'permissions._members', select: this.userFields }
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
            original_name: fileData.original_name,
            modified_name: fileData.modified_name,
            minio_etag: fileData.minio_etag,
            minio_versionId: fileData.minio_versionId,
            type: fileData.type,
            mime_type: fileData.mime_type,
            _folder: (fileData._folder && fileData._folder != '') ? fileData._folder : null,
            _parent: fileData._parent,
            _posted_by: fileData._posted_by,
            created_date: DateTime.now()
        }

        // Create the new File
        file = await File.create(file);

        // If it is the first version of the file, add a new version
        if (!fileData._parent) {
            await File.create({
                    _group: fileData._group,
                    original_name: fileData.original_name,
                    modified_name: fileData.modified_name,
                    minio_etag: fileData.minio_etag,
                    minio_versionId: fileData.minio_versionId,
                    type: fileData.type,
                    mime_type: fileData.mime_type,
                    _folder: (fileData._folder && fileData._folder != '') ? fileData._folder : null,
                    _parent: file._id,
                    _posted_by: fileData._posted_by,
                    created_date: DateTime.now()
                });
        } else {
            // In case the file is old (previous to versions) we count the number of versions and if there is no versions we add a 1st version
            let numVersions = await File.find({
                    $and: [
                        { _parent: fileData._parent }
                    ]
                }).countDocuments();

            if (numVersions <= 1) {
                const parentFile: any =  await File.findById({ _id: fileData._parent }).lean();
                await File.create({
                    _group: parentFile?._group,
                    original_name: parentFile?.original_name,
                    modified_name: parentFile?.modified_name,
                    minio_etag: parentFile.minio_etag,
                    minio_versionId: parentFile.minio_versionId,
                    type: parentFile?.type,
                    mime_type: parentFile?.mime_type,
                    _folder: parentFile?._folder,
                    _parent: parentFile?._id,
                    created_date: parentFile?.created_date,
                    _posted_by: parentFile?._posted_by
                });
            }

            // Update the parent modified_name, so it will point to the last version
            await File.findByIdAndUpdate({
                    _id: fileData._parent
                }, {
                    $set: { "modified_name": fileData.modified_name }
                }, {
                    new: true
                });
        }

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
     * This function is responsible for fetching file versions
     * @param fileId 
     */
    async getFileVersions(fileId: string) {

        if (fileId) {

            // Find the file by Id
            let files: any = await File.find({ _parent: fileId }).sort('-created_date');

            // Populate File Properties
            files = this.populateFileProperties(files);

            // Return file
            return files;
        }
    }

    /**
     * This function is responsible for fetching the last version of a file
     * @param fileId 
     */
    async getFileLastVersion(fileId: string) {
        let file;
        if (fileId) {
            let files: any = await File.find({ _parent: fileId }).sort('-created_date');

            if (files && files.length > 0) {
                file = files[0];
            } else {
                file = await File.findOne({_id: fileId});
            }

            // Populate File Properties
            file = this.populateFileProperties(file);
        }

        // Return file
        return file;
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
                        { _id: { $lt: lastFileId } },
                        { _parent: null }
                    ]
                };
            } else {
                query = {
                    $and: [
                        { _group: groupId },
                        { _folder: { $eq: null } },
                        { _id: { $lt: lastFileId } },
                        { _parent: null }
                    ]
                };
            }

            files = await File.find(query)
                .sort('-_id')
                .limit(5)
                .populate([
                    { path: '_group', select: this.groupFields },
                    { path: '_posted_by', select: this.userFields },
                    { path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' },
                    { path: 'approval_history._actor', select: '_id first_name last_name profile_pic' },
                    { path: '_folder', select: this.folderFields }
                ])
                .lean();

        } else {
            if (folderId) {
                query = {
                    $and: [
                        { _group: groupId },
                        { _folder: folderId },
                        { _parent: null }
                    ]
                };
            } else {
                query = {
                    $and: [
                        { _group: groupId },
                        { _folder: { $eq: null } },
                        { _parent: null }
                    ]
                };
            }
            files = await File.find(query)
                .sort('-_id')
                //.limit(10)
                .populate([
                    { path: '_group', select: this.groupFields },
                    { path: '_posted_by', select: this.userFields },
                    { path: '_folder', select: this.folderFields },
                    { path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' },
                    { path: 'approval_history._actor', select: '_id first_name last_name profile_pic' },
                    { path: 'permissions._members', select: this.userFields }
                ])
                .lean();
        }

        // Return all the files with the populated properties
        return files;

    }

    /**
     * This function is responsible for returning the filtered files of a folder
     * @param groupId 
     */
    async getFilter(groupId: string, folderId: string, filterBit: string, filterData: any) {

        let files: any = []

        let query = {};

        if (filterBit == 'created_today') {
            const todayStartDay = moment().local().startOf('day').format();
            const todayEndDay = moment().local().endOf('day').format();
            if (folderId) {
                query = {
                    $and: [
                        { _group: groupId },
                        { _folder: folderId },
                        { created_date:  { $gte: todayStartDay, $lte: todayEndDay }},
                        { _parent: null }
                    ]
                };
            } else {
                query = {
                    $and: [
                        { _group: groupId },
                        { created_date:  { $gte: todayStartDay, $lte: todayEndDay }},
                        { _folder: null },
                        { _parent: null }
                    ]
                };
            }
        } else if (filterBit == 'created_last_week') {
            const todayForFiles = moment().local().endOf('day').format();
            const todayMinus7DaysForFiles = moment().local().subtract(7, 'days').endOf('day').format();
            if (folderId) {
                query = {
                    $and: [
                        { _group: groupId },
                        { _folder: folderId },
                        { created_date:  { $gte: todayMinus7DaysForFiles, $lte: todayForFiles }},
                        { _parent: null }
                    ]
                };
            } else {
                query = {
                    $and: [
                        { _group: groupId },
                        { created_date:  { $gte: todayMinus7DaysForFiles, $lte: todayForFiles }},
                        { _folder: null },
                        { _parent: null }
                    ]
                };
            }
        } else if (filterBit == 'created_14_days') {
            const todayForFiles = moment().local().endOf('day').format();
            const todayMinus7DaysForFiles = moment().local().subtract(14, 'days').endOf('day').format();
            if (folderId) {
                query = {
                    $and: [
                        { _group: groupId },
                        { _folder: folderId },
                        { created_date:  { $gte: todayMinus7DaysForFiles, $lte: todayForFiles }},
                        { _parent: null }
                    ]
                };
            } else {
                query = {
                    $and: [
                        { _group: groupId },
                        { created_date:  { $gte: todayMinus7DaysForFiles, $lte: todayForFiles }},
                        { _folder: null },
                        { _parent: null }
                    ]
                };
            }
        } else if (filterBit == "users") {
            if (folderId) {
                query = {
                    $and: [
                        { _group: groupId },
                        { _folder: folderId },
                        { _posted_by:  filterData },
                        { _parent: null }
                    ]
                };
            } else {
                query = {
                    $and: [
                        { _group: groupId },
                        { _posted_by:  filterData },
                        { _folder: null },
                        { _parent: null }
                    ]
                };
            }
        } else if (filterBit == "custom_field") {
            const cf = filterData.cf;
            const cfValue = filterData.cfValue;

            if (folderId) {
                query = {
                    $and: [
                        { _group: groupId },
                        { _folder: folderId },
                        { _parent: null }
                    ]
                };
            } else {
                query = {
                    $and: [
                        { _group: groupId },
                        { _folder: null },
                        { _parent: null }
                    ]
                };
            }
            
            files = await File.find(query)
                .sort('-_id')
                .populate([
                        { path: '_group', select: this.groupFields },
                        { path: '_posted_by', select: this.userFields },
                        { path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' },
                        { path: 'approval_history._actor', select: '_id first_name last_name profile_pic' },
                        { path: '_folder', select: this.folderFields },
                        { path: 'permissions._members', select: this.userFields }
                    ])
                .lean();

            if (cf.input_type_date) {
                const todayStartDay = moment(cfValue).local().startOf('day').format();
                const todayEndDay = moment(cfValue).local().endOf('day').format();
                files = files.filter(file => {
                    return (file.custom_fields && file.custom_fields != undefined && file.custom_fields != 'undefined'
                    && moment(file.custom_fields[cf.name]).isSameOrAfter(todayStartDay)
                    && moment(file.custom_fields[cf.name]).isSameOrBefore(todayEndDay))
                    
                });
            } else {
                files = files.filter(file => file.custom_fields && file.custom_fields[cf.name] && file.custom_fields[cf.name] == cfValue);
            }
            return files;
        } else {
            if (folderId) {
                query = {
                    $and: [
                        { _group: groupId },
                        { _folder: folderId },
                        { _parent: null }
                    ]
                };
            } else {
                query = {
                    $and: [
                        { _group: groupId },
                        { _folder: null },
                        { _parent: null }
                    ]
                };
            }
        }

        files = await File.find(query)
            .sort('-_id')
            .populate([
                    { path: '_group', select: this.groupFields },
                    { path: '_posted_by', select: this.userFields },
                    { path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' },
                    { path: 'approval_history._actor', select: '_id first_name last_name profile_pic' },
                    { path: '_folder', select: this.folderFields },
                    { path: 'permissions._members', select: this.userFields }
                ])
            .lean();

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
                _parent: null,
                $or: [
                    { original_name: { $regex: new RegExp(query, 'i') }},
                    { description: { $regex: new RegExp(query, 'i') }},
                    { tags: { $regex: new RegExp(query, 'i') }},
                    //{ custom_fields: { $regex: new RegExp(query, 'i') }}
                ]
            })
            .sort('-_id')
            //.limit(5)
            .populate([
                { path: '_group', select: this.groupFields },
                { path: '_posted_by', select: this.userFields },
                { path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' },
                { path: 'approval_history._actor', select: '_id first_name last_name profile_pic' },
                { path: 'permissions._members', select: this.userFields }
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
                let flamingo = await Flamingo.findOne({ _file: fileId });
                flamingo = await Flamingo.populate(flamingo, [
                    { path: '_questions' }
                ]);

                if (flamingo) {
                    flamingo = await Flamingo.findByIdAndDelete({ _id: flamingo._id });

                    // Delete the questions
                    flamingo._questions.forEach(async question => {
                        await Question.findByIdAndDelete({
                            _id: question._id || question
                        });
                    });
                }
            }

            if (deletedFile && deletedFile._parent) {
                let numVersions;
                numVersions = await File.find({
                    $and: [
                        { _parent: deletedFile._parent }
                    ]
                }).countDocuments();

                if (numVersions && numVersions <= 1) {
                    await File.findByIdAndDelete(deletedFile._parent);
                }
            } else {
                await File.deleteMany({ _parent: fileId });
            }

            await File.findByIdAndDelete(fileId);

            // Return file
            return deletedFile;
        }
    }

    async findWorkspaceGroupsShareFiles(workspaceId: string) {
        const groups = await Group.find({
                $and: [
                    { share_files: true },
                    { _workspace: workspaceId },
                ]
            }).select('_id');

        let groupsIds = [];
        groups.forEach(group => {
            groupsIds.push(group._id);
        });

        return groupsIds;
    }

    async findGroupsShareFiles(groupId: string, workspaceId: string) {
        const groups = await Group.find({
            $and: [
                { share_files: true },
                { _id: { $ne: groupId } },
                { _workspace: workspaceId }
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

            // Update versions
            await File.updateMany({
                    _parent: fileId
                }, {
                    $set: { _group: groupId }
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
            for (let i = 0; i < oldFiles.length; i++) {
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

    /**
     * This function is responsible for fetching the campaign type file
     * @param groupId
     */
    async getCampaignFile(groupId: any) {

        if (groupId) {

            // Find the file by Id
            let file: any = await File.find(
                {
                    $and: [
                        { _group: groupId },
                        { type: 'campaign' }
                    ]
                }
            ).sort('-_id')

            // Populate File Properties
            file = this.populateFileProperties(file)

            // Return file
            return file;
        }
    }

    async changeCustomFieldValue(fileId: string, customFieldName: any, customFieldValue: any) {
      try {
        let file = await File.findById(fileId);
  
        if (!file['custom_fields']) {
            file['custom_fields'] = new Map<string, string>();
        }
        file['custom_fields'].set(customFieldName, customFieldValue);
  
        // Find the post and update the custom field
        file = await File.findByIdAndUpdate({
          _id: fileId
        }, {
          $set: { "custom_fields": file['custom_fields'] }
        }, {
            new: true
        });
  
        return await this.populateFileProperties(file);
  
      } catch (error) {
        throw (error);
      }
    }
}