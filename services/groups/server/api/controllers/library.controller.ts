import { File, Collection, Page, Group, User, Workspace, Folder } from '../models';
import { Response, Request, NextFunction } from 'express';
import { axios, sendError } from '../../utils';
import { LibraryService } from '../services';
import { DateTime } from 'luxon';
import http from 'axios';

const libraryService = new LibraryService();

/*  ===================
 *  -- Collection METHODS --
 *  ===================
 * */
export class LibraryController {
    /**
     * This function fetches the collection details corresponding to the @constant collectionId 
     * @param req - @constant collectionId
     */
    async getCollection(req: Request, res: Response) {
        try {

            const { collectionId } = req.params;

            // If collectionId is null or not provided then we throw BAD REQUEST 
            if (!collectionId) {
                return res.status(400).json({
                    message: 'Please provide collectionId!'
                });
            }

            // Find the Collection based on the collectionId
            var collection = await Collection.findOne({
                    _id: collectionId
                })
                .populate({ path: '_members', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_group', select: 'group_name group_avatar _members _admins' })
                .populate({ path: '_content_mentions', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_created_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_updated_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_pages', select: 'title _parent _created_by created_date updated_date' })
                .populate({ path: '_pages._created_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_files', select: 'original_name modified_name type' })
                .populate({ path: 'share.groups._group', select: 'group_name group_avatar _members _admins' })
                .populate({ path: 'share.users._user', select: '_id first_name last_name profile_pic' })
                .lean();

            // Check if collection already exist with the same collectionId
            if (!collection) {
                return sendError(res, new Error('Oops, collection not found!'), 'Collection not found, Invalid collectionId!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: 'Collection found!',
                collection: collection
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function creates the new collection in group
     * @constant userId
     */
    async createCollection(req: Request, res: Response) {
        try {

            // Preparing the collection data
            const { collection } = req.body;

            // If collection_name is null or not provided then we throw BAD REQUEST 
            if (!collection) {
                return res.status(400).json({
                    message: 'Please provide collection!'
                });
            }

            let collectionData = await Collection.create(collection);

            collectionData = await Collection.findOne({
                    _id: collectionData?._id
                })
                .populate({ path: '_members', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_group', select: 'group_name group_avatar _members _admins' })
                .populate({ path: '_content_mentions', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_created_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_updated_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_pages', select: 'title _parent _created_by created_date updated_date' })
                .populate({ path: '_pages._created_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_files', select: 'original_name modified_name type' })
                .populate({ path: 'share.groups._group', select: 'group_name group_avatar _members _admins' })
                .populate({ path: 'share.users._user', select: '_id first_name last_name profile_pic' })
                .lean();

            // Send the status 200 response
            return res.status(200).json({
                message: 'Collection Created Successfully!',
                collection: collectionData
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function is responsible for updating the collection data to the corresponding @constant collectionId
     * @param req - @constant collectionId 
     * It only Updates @collection_name and @description
     */
    async updateCollection(req: Request, res: Response) {
        try {
            const { collectionId } = req.params;
            const { body } = req;

            // If collectionId is null or not provided then we throw BAD REQUEST 
            if (!collectionId || !body) {
                return res.status(400).json({
                    message: 'Please provide collectionId and properties to update!'
                });
            }

            const collection: any = await Collection.findOneAndUpdate(
                    { _id: collectionId },
                    { $set: body.properties },
                    { new: true }
                )
                .populate({ path: '_members', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_group', select: 'group_name group_avatar _members _admins' })
                .populate({ path: '_content_mentions', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_created_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_updated_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_pages', select: 'title _parent _created_by created_date updated_date' })
                .populate({ path: '_pages._created_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_files', select: 'original_name modified_name type' })
                .populate({ path: 'share.groups._group', select: 'group_name group_avatar _members _admins' })
                .populate({ path: 'share.users._user', select: '_id first_name last_name profile_pic' })
                .lean();

            if (!collection) {
                return sendError(res, new Error('Oops, collection not found!'), 'Collection not found, invalid collectionId!', 404);
            }

            return res.status(200).json({
                message: `${collection.name} collection was updated successfully!`,
                collection: collection
            });

        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function is responsible for updating the collection data to the corresponding @constant collectionId
     * @param req - @constant collectionId 
     */
    async updateCollectionContent(req: Request, res: Response) {
        try {
            const { collectionId } = req.params;
            const { body: { collection } } = req;
            const userId = req['userId'];

            // If collectionId is null or not provided then we throw BAD REQUEST 
            if (!collectionId || !collection) {
                return res.status(400).json({
                    message: 'Please provide collectionId and properties to update!'
                });
            }

            const collectionData: any = await Collection.findOneAndUpdate(
                    { _id: collectionId },
                    { $set: JSON.parse(collection) },
                    { new: true }
                )
                .populate({ path: '_members', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_group', select: 'group_name group_avatar _members _admins' })
                .populate({ path: '_content_mentions', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_created_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_updated_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_pages', select: 'title _parent _created_by created_date updated_date' })
                .populate({ path: '_pages._created_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_files', select: 'original_name modified_name type' })
                .populate({ path: 'share.groups._group', select: 'group_name group_avatar _members _admins' })
                .populate({ path: 'share.users._user', select: '_id first_name last_name profile_pic' })
                .lean();

            if (!collectionData) {
                return sendError(res, new Error('Oops, collection not found!'), 'Collection not found, invalid collectionId!', 404);
            }

            // Send notifications to _content_mentions
            const mentions = collectionData?._content_mentions?.map(mention => mention._id);
            await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/collection-mentions`, {
                userId: userId,
                collectionId: collectionId,
                mentions: mentions
            });

            return res.status(200).json({
                message: `${collectionData.collection_name} collection was updated successfully!`,
                collection: collectionData
            });

        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function is responsible for updating the collection data to the corresponding @constant collectionId
     */
    async removeCollection(req: Request, res: Response) {
        try {
            const { collectionId, workspaceId } = req.params;

            // If collectionId is null or not provided then we throw BAD REQUEST 
            if (!collectionId || !workspaceId) {
                return res.status(400).json({
                    message: 'Please provide collectionId and workspaceId!'
                });
            }

            libraryService.deleteCollection(collectionId, workspaceId);

            return res.status(200).json({
                message: `Collection removed successfully!`,
            });

        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function is responsible for updating the collection data to the corresponding @constant collectionId
     */
    async addEditor(req: Request, res: Response) {
        try {
            const { collectionId } = req.params;
            const { assignee } = req.body;

            // If collectionId is null or not provided then we throw BAD REQUEST 
            if (!collectionId || !assignee) {
                return res.status(400).json({
                    message: 'Please provide collectionId and assigneeId!'
                });
            }

            const collection: any = await Collection.findOneAndUpdate(
                    { _id: collectionId },
                    { 
                        $addToSet: {
                            _members: assignee
                        }
                    },
                    { new: true }
                )
                .populate({ path: '_members', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_group', select: 'group_name group_avatar _members _admins' })
                .populate({ path: '_content_mentions', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_created_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_updated_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_pages', select: 'title _parent _created_by created_date updated_date' })
                .populate({ path: '_pages._created_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_files', select: 'original_name modified_name type' })
                .populate({ path: 'share.groups._group', select: 'group_name group_avatar _members _admins' })
                .populate({ path: 'share.users._user', select: '_id first_name last_name profile_pic' })
                .lean();

            if (!collection) {
                return sendError(res, new Error('Oops, collection not found!'), 'Collection not found, invalid collectionId!', 404);
            }

            return res.status(200).json({
                message: `Editor added to collection successfully!`,
                collection: collection
            });

        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function is responsible for updating the collection data to the corresponding @constant collectionId
     */
    async removeEditor(req: Request, res: Response) {
        try {
            const { collectionId } = req.params;
            const { assignee } = req.body;

            // If collectionId is null or not provided then we throw BAD REQUEST 
            if (!collectionId || !assignee) {
                return res.status(400).json({
                    message: 'Please provide collectionId and assigneeId!'
                });
            }

            const collection: any = await Collection.findOneAndUpdate(
                    { _id: collectionId },
                    { 
                        $pull: { _members: assignee }
                    },
                    { new: true }
                )
                .populate({ path: '_members', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_group', select: 'group_name group_avatar _members _admins' })
                .populate({ path: '_content_mentions', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_created_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_updated_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_pages', select: 'title _parent _created_by created_date updated_date' })
                .populate({ path: '_pages._created_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_files', select: 'original_name modified_name type' })
                .populate({ path: 'share.groups._group', select: 'group_name group_avatar _members _admins' })
                .populate({ path: 'share.users._user', select: '_id first_name last_name profile_pic' })
                .lean();

            if (!collection) {
                return sendError(res, new Error('Oops, collection not found!'), 'Collection not found, invalid collectionId!', 404);
            }

            return res.status(200).json({
                message: `Editor removed from collection successfully!`,
                collection: collection
            });

        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function is responsible for updating the image for the particular group
     * @param { userId, fileName }req 
     * @param res 
     */
    async updateCollectionImage(req: Request, res: Response, next: NextFunction) {

        // Fetch the groupId
        const { collectionId, workspaceId } = req.params;

        // Fetch the fileName from fileHandler middleware
        const fileName = req['fileName'];

        try {
            if (!collectionId || !workspaceId || !fileName) {
                return sendError(res, new Error(`Please provide a file to upload, a collectionId, and a workspaceId!`), 'Please provide a file to upload, a collectionId, and a workspaceId!', 500);
            }

            const collection = await libraryService.updateCollectionImage(collectionId, workspaceId, fileName);

            // Send status 200 response
            return res.status(200).json({
                message: 'Collection updated!',
                collection: collection
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    async removeCollectionFile(req: Request, res: Response) {
        try {
            const { fileId, workspaceId } = req.params;

            // If collectionId is null or not provided then we throw BAD REQUEST 
            if (!fileId || !workspaceId) {
                return res.status(400).json({
                    message: 'Please provide fileId and workspaceId!'
                });
            }

            const file: any = await libraryService.deleteCollectionFile(fileId, workspaceId);

            const collection = await Collection.findById({
                    _id: file._collection
                })
                .populate({ path: '_members', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_group', select: 'group_name group_avatar _members _admins' })
                .populate({ path: '_content_mentions', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_created_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_updated_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_pages', select: 'title _parent _created_by created_date updated_date' })
                .populate({ path: '_pages._created_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_files', select: 'original_name modified_name type' })
                .populate({ path: 'share.groups._group', select: 'group_name group_avatar _members _admins' })
                .populate({ path: 'share.users._user', select: '_id first_name last_name profile_pic' })
                .lean();

            return res.status(200).json({
                message: `File removed successfully!`,
                collection: collection
            });

        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function fetches the collection details corresponding to the @constant collectionId 
     */
    async getCollectionsByGroup(req: Request, res: Response) {
        try {

            const { groupId } = req.params;

            // If collectionId is null or not provided then we throw BAD REQUEST 
            if (!groupId) {
                return res.status(400).json({
                    message: 'Please provide a groupId!'
                });
            }

            // Find the collections based on the groupId
            let collections = await Collection.find({
                    _group: groupId
                })
                .populate({ path: '_members', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_group', select: 'group_name group_avatar _members _admins' })
                .populate({ path: '_content_mentions', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_created_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_updated_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_pages', select: 'title _parent _created_by created_date updated_date' })
                .populate({ path: '_pages._created_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_files', select: 'original_name modified_name type' })
                .populate({ path: 'share.groups._group', select: 'group_name group_avatar _members _admins' })
                .populate({ path: 'share.users._user', select: '_id first_name last_name profile_pic' })
                .lean();

            // Send the status 200 response
            return res.status(200).json({
                message: `Collection group members found!`,
                collections: collections
            })
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function fetches the collection details corresponding to the @constant collectionId 
     * @param req - @constant collectionId
     */
    async getCollectionByPage(req: Request, res: Response) {
        try {
            const { pageId } = req.params;

            // If collectionId is null or not provided then we throw BAD REQUEST 
            if (!pageId) {
                return res.status(400).json({
                    message: 'Please provide pageId!'
                });
            }

            // Find the Page based on the pageId
            const page = await Page.findOne({
                    _id: pageId
                }).select('_collection').lean();

            // Find the Collection based on the page
            const collection = await Collection.findOne({
                    _id: page?._collection
                })
                .populate({ path: '_members', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_group', select: 'group_name group_avatar _members _admins' })
                .populate({ path: '_content_mentions', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_created_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_updated_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_pages', select: 'title _parent _created_by created_date updated_date' })
                .populate({ path: '_pages._created_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_files', select: 'original_name modified_name type' })
                .populate({ path: 'share.groups._group', select: 'group_name group_avatar _members _admins' })
                .populate({ path: 'share.users._user', select: '_id first_name last_name profile_pic' })
                .lean();

            // Check if collection already exist with the same collectionId
            if (!collection) {
                return sendError(res, new Error('Oops, collection not found!'), 'Collection not found, Invalid collectionId!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: 'Collection found!',
                collection: collection
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function is the boiler plate for adding files to the page
     * @param req 
     * @param res 
     * @param next 
     */
    async addCollectionFile(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the File Name From the request
            let { body: { fileData } } = req;
            const userId = req['userId'];

            // Preparing File Data
            let file = await File.create({
                _group: fileData._group,
                _collection: fileData._collection,
                original_name: fileData.original_name,
                modified_name: fileData.modified_name,
                minio_etag: fileData.minio_etag,
                minio_versionId: fileData.minio_versionId,
                type: fileData.type,
                mime_type: fileData.mime_type,
                _folder: fileData._folder,
                _posted_by: userId,
                created_date: DateTime.now()
            });

            file = await File.populate(file, [
                    { path: '_posted_by', select: '_id first_name last_name profile_pic email' }
                ]);

            // Find the collections based on the groupId
            const collection = await Collection.findByIdAndUpdate({
                    _id: fileData._collection
                }, {
                    $addToSet: {
                        _files: file._id
                    }
                }, {
                    new: true
                })
                .populate({ path: '_members', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_group', select: 'group_name group_avatar _members _admins' })
                .populate({ path: '_content_mentions', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_created_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_updated_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_pages', select: 'title _parent _created_by created_date updated_date' })
                .populate({ path: '_pages._created_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_files', select: 'original_name modified_name type' })
                .populate({ path: 'share.groups._group', select: 'group_name group_avatar _members _admins' })
                .populate({ path: 'share.users._user', select: '_id first_name last_name profile_pic' })
                .lean();

            // Send Status 200 response
            return res.status(200).json({
                message: 'File has been uploaded!',
                file: file,
                collection: collection
            });

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function fetches the list of spaces from confluence based on the user
     */
    async getUserConfluenceSpaces(req: Request, res: Response) {
        try {

            const userId = req['userId'];
            const { workspaceId } = req.params;

            // If collectionId is null or not provided then we throw BAD REQUEST 
            if (!userId || !workspaceId) {
                return res.status(400).json({
                    message: 'Please provide a userId && workspaceId!'
                });
            }

            let spaces = [];

            const user = await User.findById(userId).select('email').lean();
            const workspace = await Workspace.findById(workspaceId).select('integrations').lean();

            const domain = workspace?.integrations?.atlassia_url;
            const token = workspace?.integrations?.atlassia_token;
            const email = user.email + ':' + token;
            await axios.get(`https://${domain}/wiki/rest/api/space`, {
                    headers: {
                            'Authorization': `Basic ${Buffer.from(email).toString('base64')}`,
                            'Accept': 'application/json'
                        }
                    }
                )
                .then(response => {
                    spaces = response.data.results;
                    // return response.text();
                })
                // .then(text => console.log(text))
                .catch(err => console.error(err));

            // Send the status 200 response
            return res.status(200).json({
                message: `Confluence Spaces found!`,
                spaces: spaces
            })
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function fetches the list of spaces from confluence based on the user
     */
    async exportConfluenceSpaces(req: Request, res: Response) {
        try {

            const userId = req['userId'];
            let { body: { spacesToExport } } = req;
            const { workspaceId, groupId } = req.params;

            // If collectionId is null or not provided then we throw BAD REQUEST 
            if (!userId || !workspaceId || !workspaceId) {
                return res.status(400).json({
                    message: 'Please provide a userId, a workspaceId, and a groupId!'
                });
            }

            let collections = [];

            const user = await User.findById(userId).select('email').lean();
            const workspace = await Workspace.findById(workspaceId).select('integrations').lean();

            const domain = workspace?.integrations?.atlassia_url;
            const token = workspace?.integrations?.atlassia_token;
            const email = user.email + ':' + token;

            const spacesArray = spacesToExport.split(',');

            for (let i = 0; i < spacesArray.length ; i++) {
                collections = collections.concat(await libraryService.exportConfluenceSpaceDetailsToCollection(domain, spacesArray[i], email, userId, groupId, workspaceId));
            }
// ATATT3xFfGF0_9HXph47_wu1Q1Yhfa9O1YW2Sodb2k-q_sFWAT3Z-G_7yA3Wv8xMhk7MsBZ-I5Hm3Rp7jh2c7uRPl--f6bmJ1DE22vt_U3yTrrOhJUwzFWMBQM_YcMoA6OrCxH2VhB4gMvRplFgNfSh_d6UMbrzsTxRtw_PPx13XRXiP8JkWAuo=C060CB65
// juan-octonius.atlassian.net
            return res.status(200).json({
                message: `Confluence Spaces found!`,
                collections: collections
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function creates the new page in collection
     */
    async createPage(req: Request, res: Response) {
        try {

            // Preparing the collection data
            const { parentPageId, newPageName } = req.body;
            const { collectionId } = req.params;
            const userId = req['userId'];

            // If collection_name is null or not provided then we throw BAD REQUEST 
            if (!newPageName || !collectionId ) {
                return res.status(400).json({
                    message: 'Please provide collectionId and a newPageName and a collectionId!'
                });
            }

            let pageData = await Page.create({
                title: newPageName,
                _collection: collectionId,
                _parent: parentPageId,
                _created_by: userId,
                _updated_by: [userId]
            });

            pageData = await Page.findOne({
                    _id: pageData?._id
                })
                .populate({ path: '_content_mentions', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_created_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_updated_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_files', select: 'original_name modified_name type' })
                .populate({ path: '_liked_by', select: 'first_name last_name profile_pic role email' })
                .lean();

            const parentPage = await Page.findOne({
                    _id: parentPageId
                })
                .populate({ path: '_content_mentions', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_created_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_updated_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_files', select: 'original_name modified_name type' })
                .populate({ path: '_liked_by', select: 'first_name last_name profile_pic role email' })
                .lean();

            // Send the status 200 response
            return res.status(200).json({
                message: 'Page Created Successfully!',
                newPage: pageData,
                page: parentPage
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function creates the new page in collection
     */
    async deletePage(req: Request, res: Response) {
        try {

            // Preparing the collection data
            const { pageId, workspaceId } = req.params;
            
            // If collection_name is null or not provided then we throw BAD REQUEST 
            if (!pageId ) {
                return res.status(400).json({
                    message: 'Please provide collectionId and a pageId!'
                });
            }

            libraryService.deletePage(pageId, workspaceId);

            // Send the status 200 response
            return res.status(200).json({
                message: 'Page Deleted Successfully!'
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function fetches the pages by collection
     */
    async getPage(req: Request, res: Response) {
        try {

            const { pageId } = req.params;

            // If collectionId is null or not provided then we throw BAD REQUEST 
            if (!pageId) {
                return res.status(400).json({
                    message: 'Please provide a pageId!'
                });
            }

            // Find the collections based on the groupId
            let page = await Page.findById(
                    { _id: pageId }
                )
                .populate({ path: '_content_mentions', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_created_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_updated_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_files', select: 'original_name modified_name type' })
                .populate({ path: '_liked_by', select: 'first_name last_name profile_pic role email' })
                .lean();

            // Send the status 200 response
            return res.status(200).json({
                message: `Page found!`,
                page: page
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function fetches the pages by collection
     */
    async getPagesByCollection(req: Request, res: Response) {
        try {

            const { collectionId } = req.params;

            // If collectionId is null or not provided then we throw BAD REQUEST 
            if (!collectionId) {
                return res.status(400).json({
                    message: 'Please provide a collectionId!'
                });
            }

            // Find the collections based on the groupId
            let pages = await Page.find({
                    $and: [
                        { _collection: collectionId },
                        { _parent: { $eq: null }}
                    ]
                })
                .populate({ path: '_content_mentions', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_created_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_updated_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_files', select: 'original_name modified_name type' })
                .populate({ path: '_liked_by', select: 'first_name last_name profile_pic role email' })
                .lean();

            // Send the status 200 response
            return res.status(200).json({
                message: `Pages found!`,
                pages: pages
            });
        } catch (err) {
            return sendError(res, err);
        }

    };

    /**
     * This function fetches the pages by collection
     */
    async getPagesByParent(req: Request, res: Response) {
        try {
            const { pageId } = req.params;

            // If collectionId is null or not provided then we throw BAD REQUEST 
            if (!pageId) {
                return res.status(400).json({
                    message: 'Please provide a pageId!'
                });
            }

            // Find the collections based on the groupId
            let pages = await Page.find({
                    _parent: pageId
                })
                .populate({ path: '_content_mentions', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_created_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_updated_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_parent', select: 'title _parent _created_by created_date updated_date' })
                .populate({ path: '_files', select: 'original_name modified_name type' })
                .populate({ path: '_liked_by', select: 'first_name last_name profile_pic role email' })
                .lean();

            // Send the status 200 response
            return res.status(200).json({
                message: `Pages found!`,
                pages: pages
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * @param req
     */
    async editPage(req: Request, res: Response) {
        try {
            const { pageId } = req.params;
            const { body } = req;
            const userId = req['userId'];

            // If collectionId is null or not provided then we throw BAD REQUEST 
            if (!pageId || !body) {
                return res.status(400).json({
                    message: 'Please provide pageId and properties to update!'
                });
            }

            let page: any = await Page.findOneAndUpdate(
                    { _id: pageId },
                    { $set: body.properties });

            page = await Page.findByIdAndUpdate({
                    _id: pageId
                }, {
                    $addToSet: {
                        _updated_by: userId
                    }
                }, {
                    new: true
                })
                .populate({ path: '_content_mentions', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_created_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_updated_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_files', select: 'original_name modified_name type' })
                .lean();

            if (!page) {
                return sendError(res, new Error('Oops, page not found!'), 'Page not found, invalid pageId!', 404);
            }

            // Send notifications to _content_mentions
            const mentions = page?._content_mentions?.map(mention => mention._id);
            await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/page-mentions`, {
                userId: userId,
                pageId: pageId,
                mentions: mentions
            });

            return res.status(200).json({
                message: `${page.titlee} page was updated successfully!`,
                page: page
            });

        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
      * This function to like the page
      * @param { userId, params: { pageId } }req 
      * @param res 
      * @param next 
      */
    async like(req: Request, res: Response, next: NextFunction) {
        try {

            // Request Data
            const { params: {pageId} } = req;
            const userId = req['userId'];
            
            // If pageId is null or not provided then we throw BAD REQUEST 
            if (!pageId) {
                return res.status(400).json({
                    message: 'Please provide page and the user!'
                })
            }

            // Edit the page 
            const page = await Page.findByIdAndUpdate({
                    _id: pageId
                }, {
                    $addToSet: {
                        _liked_by: userId
                    }
                }, {
                    new: true
                })
                .populate({ path: '_content_mentions', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_created_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_updated_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_files', select: 'original_name modified_name type' })
                .populate({ path: '_liked_by', select: 'first_name last_name profile_pic role email' })
                .lean();

            // Send the status 200 response
            return res.status(200).json({
                message: "Page edited!",
                page: page
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
      * This function to unlike the page
      * @param { userId, params: { pageId } }req 
      * @param res 
      * @param next 
      */
    async unlike(req: Request, res: Response, next: NextFunction) {
        try {

            // Request Data
            const { params: {pageId} } = req;
            const userId = req['userId'];
            
            // If pageId is null or not provided then we throw BAD REQUEST 
            if (!pageId) {
                return res.status(400).json({
                    message: 'Please provide page and the user!'
                })
            }

            // Edit the page 
            const page = await Page.findByIdAndUpdate({
                    _id: pageId
                }, {
                    $pull: {
                        _liked_by: userId
                    }
                }, {
                    new: true
                })
                .populate({ path: '_content_mentions', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_created_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_updated_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_files', select: 'original_name modified_name type' })
                .populate({ path: '_liked_by', select: 'first_name last_name profile_pic role email' })
                .lean();

            // Send the status 200 response
            return res.status(200).json({
                message: "Page edited!",
                page: page
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is the boiler plate for adding files to the page
     * @param req 
     * @param res 
     * @param next 
     */
    async addPageFile(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the File Name From the request
            let { body: { fileData } } = req;
            const userId = req['userId'];

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
            };

            file = await File.create({
                    _group: fileData._group,
                    _page: fileData._page,
                    original_name: fileData.original_name,
                    modified_name: fileData.modified_name,
                    minio_etag: fileData.minio_etag,
                    minio_versionId: fileData.minio_versionId,
                    type: fileData.type,
                    mime_type: fileData.mime_type,
                    _folder: null,
                    _posted_by: userId,
                    created_date: DateTime.now()
                });

            file = await File.populate(file, [
                    { path: '_posted_by', select: '_id first_name last_name profile_pic email' }
                ]);

            const page = await Page.findByIdAndUpdate({
                    _id: fileData._page
                }, {
                    $addToSet: {
                        _files: file._id,
                        _updated_by: userId
                    }
                }, {
                    new: true
                })
                .populate({ path: '_content_mentions', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_created_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_updated_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_files', select: 'original_name modified_name type' })
                .lean();

            // Send Status 200 response
            return res.status(200).json({
                message: 'File has been uploaded!',
                file: file,
                page: page
            });

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for updating the collection data to the corresponding @constant collectionId
     */
    async removePageFile(req: Request, res: Response) {
        try {
            const { fileId, workspaceId } = req.params;

            // If collectionId is null or not provided then we throw BAD REQUEST 
            if (!fileId || !workspaceId) {
                return res.status(400).json({
                    message: 'Please provide fileId and workspaceId!'
                });
            }

            const file: any = await libraryService.deletePageFile(fileId, workspaceId);

            const page = await Page.findByIdAndUpdate({
                    _id: file._page
                }, {
                    $addToSet: {
                        _updated_by: req['userId']
                    }
                }, {
                    new: true
                })
                .populate({ path: '_content_mentions', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_created_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_updated_by', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_files', select: 'original_name modified_name type' })
                .lean();

            return res.status(200).json({
                message: `File removed successfully!`,
                page: page
            });

        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function fetches the collection details corresponding to the @constant collectionId 
     * @param req - @constant collectionId
     */
    async getGroupByCollection(req: Request, res: Response) {
        try {

            const { collectionId } = req.params;

            // If collectionId is null or not provided then we throw BAD REQUEST 
            if (!collectionId) {
                return res.status(400).json({
                    message: 'Please provide collectionId!'
                });
            }

            // Find the Collection based on the collectionId
            var collection = await Collection.findOne({
                    _id: collectionId
                }).lean();

            // Check if collection already exist with the same collectionId
            if (!collection) {
                return sendError(res, new Error('Oops, collection not found!'), 'Collection not found, Invalid collectionId!', 404);
            }

            // Find the Group based on the groupId
            var group = await Group.findOne({
                    _id: collection?._group
                })
                .populate({
                    path: '_members',
                    select: 'first_name last_name profile_pic active role email created_date custom_fields_to_show share_files',
                    match: {
                        active: true
                    }
                })
                .populate({
                    path: '_admins',
                    select: 'first_name last_name profile_pic active role email created_date custom_fields_to_show share_files',
                    match: {
                        active: true
                    }
                })
                .populate({ path: 'rags._members', select: 'first_name last_name profile_pic role email' })
                .lean();

            // Check if group already exist with the same groupId
            if (!group) {
                return sendError(res, new Error('Oops, group not found!'), 'Group not found, Invalid groupId!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: 'Group found!',
                group: group
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function fetches the collection details corresponding to the @constant collectionId 
     * @param req - @constant collectionId
     */
    async getWorkspaceByCollection(req: Request, res: Response) {
        try {

            const { collectionId } = req.params;

            // If collectionId is null or not provided then we throw BAD REQUEST 
            if (!collectionId) {
                return res.status(400).json({
                    message: 'Please provide collectionId!'
                });
            }

            // Find the Collection based on the collectionId
            var collection = await Collection.findOne({
                    _id: collectionId
                }).lean();

            // Check if collection already exist with the same collectionId
            if (!collection) {
                return sendError(res, new Error('Oops, collection not found!'), 'Collection not found, Invalid collectionId!', 404);
            }

            // Find the Group based on the groupId
            var group = await Group.findOne({
                    _id: collection?._group
                })
                .select('_workspace')
                .lean();

            // Check if group already exist with the same groupId
            if (!group) {
                return sendError(res, new Error('Oops, group not found!'), 'Group not found, Invalid groupId!', 404);
            }

            // Find the Group based on the groupId
            var workspace = await Workspace.findOne({
                    _id: group?._workspace
                })
                .populate({
                    path: 'members',
                    select: 'first_name last_name profile_pic current_position role email active',
                })
                .lean();

            // Check if group already exist with the same groupId
            if (!workspace) {
                return sendError(res, new Error('Oops, workspace not found!'), 'Workspace not found, Invalid workspaceId!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: 'Workspace found!',
                workspace: workspace
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function fetches the collection details corresponding to the @constant collectionId 
     * @param req - @constant collectionId
     */
    async getGroupByPage(req: Request, res: Response) {
        try {

            const { pageId } = req.params;

            // If collectionId is null or not provided then we throw BAD REQUEST 
            if (!pageId) {
                return res.status(400).json({
                    message: 'Please provide pageId!'
                });
            }

            // Find the Collection based on the collectionId
            var page = await Page.findOne({
                    _id: pageId
                })
                .populate({ path: '_collection', select: '_id _group' })
                .populate({ path: '_collection._group', select: '_id' })
                .lean();

            // Check if collection already exist with the same collectionId
            if (!page) {
                return sendError(res, new Error('Oops, collection not found!'), 'Collection not found, Invalid collectionId!', 404);
            }

            // Find the Group based on the groupId
            var group = await Group.findOne({
                    _id: page?._collection?._group?._id
                })
                .populate({
                    path: '_members',
                    select: 'first_name last_name profile_pic active role email created_date custom_fields_to_show share_files',
                    match: {
                        active: true
                    }
                })
                .populate({
                    path: '_admins',
                    select: 'first_name last_name profile_pic active role email created_date custom_fields_to_show share_files',
                    match: {
                        active: true
                    }
                })
                .populate({ path: 'rags._members', select: 'first_name last_name profile_pic role email' })
                .lean();

            // Check if group already exist with the same groupId
            if (!group) {
                return sendError(res, new Error('Oops, group not found!'), 'Group not found, Invalid groupId!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: 'Group found!',
                group: group
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function fetches the collection details corresponding to the @constant collectionId 
     * @param req - @constant collectionId
     */
    async getWorkspaceByPage(req: Request, res: Response) {
        try {

            const { pageId } = req.params;

            // If collectionId is null or not provided then we throw BAD REQUEST 
            if (!pageId) {
                return res.status(400).json({
                    message: 'Please provide pageId!'
                });
            }

            // Find the Collection based on the collectionId
            var page = await Page.findOne({
                    _id: pageId
                })
                .populate({ path: '_collection', select: '_id _group' })
                .populate({ path: '_collection._group', select: '_id' })
                .lean();

            // Check if collection already exist with the same collectionId
            if (!page) {
                return sendError(res, new Error('Oops, collection not found!'), 'Collection not found, Invalid collectionId!', 404);
            }

            // Find the Group based on the groupId
            var group = await Group.findOne({
                    _id: page?._collection?._group?._id
                })
                .select('_workspace')
                .lean();

            // Check if group already exist with the same groupId
            if (!group) {
                return sendError(res, new Error('Oops, group not found!'), 'Group not found, Invalid groupId!', 404);
            }
console.log(group);
            // Find the Group based on the groupId
            var workspace = await Workspace.findOne({
                    _id: group?._workspace
                })
                .populate({
                    path: 'members',
                    select: 'first_name last_name profile_pic current_position role email active',
                })
                .lean();
console.log(workspace);
            // Check if group already exist with the same groupId
            if (!workspace) {
                return sendError(res, new Error('Oops, workspace not found!'), 'Workspace not found, Invalid workspaceId!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: 'Workspace found!',
                workspace: workspace
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function is used to search list of the files
     * @param req 
     * @param res 
     * @param next 
     */
    async searchPages(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the File Name From the request
            let { query: { groupId, query }, params: { workspaceId } } = req;

            // Files List
            let pages = [];

            // TODO try to add a join query in the searchFiles method instead of making two calls to the DB
            let groupsIdArray = [];
            const groups = await Group.find({
                    $and: [
                        { share_files: true },
                        { _workspace: workspaceId },
                        { _id: { $ne: groupId } },
                    ]
                }).select('_id');

            let groupsIds = [];
            groups.forEach(group => {
                groupsIds.push(group._id);
            });

            groupsIdArray = groupsIds;

            if (groupId) {
                groupsIdArray.push(groupId.toString());
            }

            const collections = await Collection.find({ _group: { $in: groupsIdArray } }).select('_id').lean();
            let collectionsIds = [];
            collections.forEach(collection => {
                collectionsIds.push(collection._id);
            });

            query = query.toString();

            // Fetch pages on the basis of the params
            pages = await Page.find({
                    _collection: { "$in": collectionsIds },
                    $or: [
                        { content: { $regex: query, $options: 'i' } },
                        { title: { $regex: query, $options: 'i' } }
                    ]
                })
                .sort('-_id')
                .select('_id title')
                .lean();

            pages = pages.map(page => ({
                _id: page._id,
                title: page.title,
                type: 'page'
            }));

            // Send Status 200 response
            return res.status(200).json({
                message: 'Pages list fetched!',
                pages: pages
            });

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for fetching all folders of a collection
     * @param collectionId 
     * @param folderId 
     */
    async getFolders(req: Request, res: Response, next: NextFunction) {
        try{
            let { query: { folderId }, params: { collectionId } } = req;

            let query = {};
            if (!!folderId && folderId != 'undefined' && folderId != 'null') {
                query = {
                    _parent: folderId,
                    _collection: collectionId
                };
            } else {
                query = {
                    _parent: { $eq: null },
                    _collection: collectionId
                };
            }

            const folders = await Folder.find(query)
                .sort('folder_name')
                .populate([
                    { path: '_group', select: 'group_name group_avatar workspace_name' },
                    { path: '_collection', select: 'name collection_avatar' },
                    { path: '_created_by', select: 'first_name last_name profile_pic role email' },
                    { path: 'permissions._members', select: 'first_name last_name profile_pic role email' }
                ])
                .lean();

            // Return all the folders with the populated properties
            return res.status(200).json({
                message: 'Folders list fetched!',
                folders: folders
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for fetching a specific folder
     * @param folderId 
     */
    async getFolder(req: Request, res: Response, next: NextFunction) {
        try {
            let { params: { folderId }} = req;

            const folder = await Folder.findById({
                    _id: folderId
                })
                .populate([
                    { path: '_group', select: 'group_name group_avatar workspace_name' },
                    { path: '_collection', select: 'name collection_avatar' },
                    { path: '_created_by', select: 'first_name last_name profile_pic role email' },
                    { path: 'permissions._members', select: 'first_name last_name profile_pic role email' }
                ])
                .lean();

            // Return all the folders with the populated properties
            return res.status(200).json({
                message: 'Folder details fetched!',
                folder: folder
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for fetching a specific folder
     * @param folderId 
     */
    async getFiles(req: Request, res: Response, next: NextFunction) {
        try {
            let { query: { folderId }, params: { collectionId } } = req;

            let query = {};
            if (!!folderId && folderId != 'undefined' && folderId != 'null') {
                query = {
                    _folder: folderId,
                    _collection: collectionId
                };
            } else {
                query = {
                    _folder: { $eq: null },
                    _collection: collectionId
                };   
            }

            const files = await File.find(query)
                .populate([
                    { path: '_collection', select: 'name collection_avatar' },
                    { path: '_folder', select: '_id folder_name _parent' }
                ])
                .lean();

            // Return all the folders with the populated properties
            return res.status(200).json({
                message: 'Folders list fetched!',
                files: files
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }
}
