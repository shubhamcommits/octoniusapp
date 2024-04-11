import { Auths } from '../../utils/auths';
import { sendError } from "../../utils/senderror";
import { FilesService } from "../services";
import { User } from "../models";
import { DateTime } from 'luxon';
import { extname } from 'path';
import { getWopiMethods } from '../../utils/filehandlers';

let http = require('http');
let https = require('https');
const fs = require('fs');
const path = require('path');
const minio = require('minio');

// Create instance of files service
let filesService = new FilesService();
let authsHelper = new Auths();

export class LibreofficeControllers {

    async libreofficeUrl(req, res) {
        try {
            const userId = req['userId'];
            const user: any = await User.findOne({ _id: userId })
                .select('_workspace')
                .populate({
                    path: '_workspace',
                    select: 'integrations'
                })
                .lean();

            const useMS365 = (user._workspace.integrations.is_ms_365_connected && !!user._workspace.integrations.ms_365_online_host);
            let onlineHost = (useMS365) ? user._workspace.integrations.ms_365_online_host : process.env.LIBREOFFICE_SERVER;
            
            res.json(await getWopiMethods(onlineHost, useMS365));
        } catch(err) {
            return sendError(res, new Error(err), 'Bad Request, please check into error stack!', 400);
        }
    }

    /* *
    *  wopi CheckFileInfo endpoint
    *
    *  Returns info about the file with the given document id.
    *  The response has to be in JSON format and at a minimum it needs to include
    *  the file name and the file size.
    *  The CheckFileInfo wopi endpoint is triggered by a GET request at
    *  https://HOSTNAME/wopi/files/<document_id>
    */
    async checkFileInfo(req, res) {
        const fileId = req.params.fileId;
        const userId = req['userId'];
        
        if (!fileId) {
            return sendError(res, new Error('Please pass the fileId in the request params.'), 'Please pass the fileId in the request params.', 400);
        }
        
        try {
            const  file = await filesService.getOne(fileId);

            if (!file) {
                return sendError(res, new Error('File not found.'), 'File not found.', 400);
            }

            // Get last version of the file on the basis of the fileId
            let fileLastVersion;
            const fileVersions = await filesService.getFileVersions(fileId);
            if (fileVersions && fileVersions.length > 0) {
                fileVersions?.sort((f1, f2) => {
                    if (f1.created_date && f2.created_date) {
                        if (DateTime.fromISO(f1.created_date).startOf('day').toMillis() < DateTime.fromISO(f2.created_date).startOf('day').toMillis()) {
                            return 1;
                        } else {
                            return -1;
                        }
                    } else {
                        if (f1.created_date && !f2.created_date) {
                            return 1;
                        } else if (!f1.created_date && f2.created_date) {
                            return -1;
                        }
                    }
                });
                fileLastVersion = fileVersions[0];
            } else {
                fileLastVersion = file;
            }

            if (!fileLastVersion) {
                return sendError(res, new Error('File not found.'), 'File not found.', 400);
            }

            // calculate if user can edit file based on RAD
            const user: any = await User.findOne({ _id: userId })
                .select('_workspace')
                .populate({
                    path: '_workspace',
                    select: 'integrations'
                })
                .lean();

            let canEdit;
            if (fileLastVersion._parent || fileLastVersion?._id == fileId) {
                canEdit = await authsHelper.canUserEditFileAction(fileLastVersion, user, fileId);
            } else {
                canEdit = false;
            }

            let fileInfo = {};
            if (user._workspace.integrations.is_ms_365_connected && !!user._workspace.integrations.ms_365_online_host) {
                const actionUrls = (await getWopiMethods(user._workspace.integrations.ms_365_online_host, true))[extname(fileLastVersion.original_name).replace('.', '')];
                const editUrl = actionUrls?.find((x: string[]) => x[0] === 'edit')[1];
                const viewUrl = actionUrls?.find((x: string[]) => x[0] === 'view')[1];
                const wopiServer = user._workspace.integrations.ms_365_online_host;
                const query = Object.entries(req.query).reduce(
                    (accumulator, [key, value]) => {
                    const q = key === 'access_token_ttl' ? 'access_token_ttl=0&' : `${key}=${value}&`;

                    return accumulator + q;
                    }, '') + `WOPISrc=${encodeURIComponent(wopiServer + req.originalUrl.split('?')[0])}`;
                const hostEditUrl = `${editUrl}${editUrl?.endsWith('?') ? '' : '&'}${query}`;
                const hostViewUrl = `${viewUrl}${viewUrl?.endsWith('?') ? '' : '&'}${query}`;

                fileInfo = {
                    AllowExternalMarketplace: true,
                    BaseFileName: fileLastVersion.original_name,
                    BreadcrumbBrandName: 'LocalStorage WOPI Host',
                    BreadcrumbBrandUrl: wopiServer,
                    BreadcrumbDocName: fileLastVersion.original_name,
                    BreadcrumbFolderName: 'WopiStorage',
                    BreadcrumbFolderUrl: wopiServer,
                    HostEditUrl: `${wopiServer}?action_url=${encodeURIComponent(hostEditUrl)}`,
                    HostViewUrl: `${wopiServer}?action_url=${encodeURIComponent(hostViewUrl)}`,
                    // LastModifiedTime: new Date(fileStats.mtime).toISOString(),
                    OwnerId: user.first_name + ' ' + user.last_name,
                    ReadOnly: !canEdit,
                    // Size: fileStats.size,
                    SupportsCoauth: true,
                    SupportsCobalt: false,
                    SupportsDeleteFile: true,
                    SupportsExtendedLockLength: true,
                    SupportsGetLock: true,
                    SupportsLocks: true,
                    SupportsRename: true,
                    SupportsUpdate: true,
                    UserCanRename: true,
                    UserCanWrite: true,
                    UserFriendlyName: user.first_name + ' ' + user.last_name,
                    UserId: user.first_name + ' ' + user.last_name,
                    // Version: fileStats.mtimeMs.toString(),
                }
            } else {
                fileInfo = {
                    BaseFileName: fileLastVersion.original_name,
                    OwnerId: fileLastVersion?._posted_by?._id || fileLastVersion?._posted_by,
                    UserId: user._id || '',
                    UserFriendlyName: user.first_name + ' ' + user.last_name,
                    UserExtraInfo: {
                        avatar: process.env.UTILITIES_USERS_UPLOADS + '/' + req.params.workspaceId + '/' + user.profile_pic + '?noAuth=true',
                        mail: user.email
                    },
                    UserCanWrite: canEdit,
                    UserCanNotWriteRelative: true, // to show Save As button
                    HidePrintOption: true,
                    DisableExport: true,
                    SupportsUpdate: true,
                };
            }
            
            return res.json(fileInfo);
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /* *
    *  wopi GetFile endpoint
    *
    *  Given a request access token and a document id, sends back the contents of the file.
    *  The GetFile wopi endpoint is triggered by a request with a GET verb at
    *  https://HOSTNAME/wopi/files/<document_id>/<workspace_id>/contents
    */
    async getFile(req, res) {
        const fileId = req.params.fileId;

        if (!fileId) {
            return sendError(res, new Error('Please pass the fileId in the request params.'), 'Please pass the fileId in the request params.', 400);
        }

        const file = await filesService.getOne(fileId);

        if (file) {
            var minioClient = new minio.Client({
                endPoint: process.env.MINIO_DOMAIN,
                port: +(process.env.MINIO_API_PORT),
                useSSL: process.env.MINIO_PROTOCOL == 'https',
                accessKey: process.env.MINIO_ACCESS_KEY,
                secretKey: process.env.MINIO_SECRET_KEY
            });

            minioClient.getObject(req.params.workspaceId, file.modified_name, (error, stream) => {
                if (error) {
                    return res.status(500).json({
                        message: 'Error getting file.',
                        error: error
                    });
                }

                res.setHeader('Content-Type', 'application/octet-stream');
                res.setHeader('Content-Disposition', `attachment; filename=${file.modified_name}`);
                stream.pipe(res);
            });
        } else {
            // we just return the content of a fake text file
            // in a real case you should use the file id
            // for retrieving the file from the storage and
            // send back the file content as response
            res.send('');
        }
    }

    /* *
    *  wopi PutFile endpoint
    *
    *  Given a request access token and a document id, replaces the files with the POST request body.
    *  The PutFile wopi endpoint is triggered by a request with a POST verb at
    *  https://HOSTNAME/wopi/files/<document_id>/<workspace_id>/contents
    */
    async putFile(req, res) {
        const fileId = req.params.fileId;

        if (!fileId) {
            return sendError(res, new Error('Please pass the fileId in the request params.'), 'Please pass the fileId in the request params.', 400);
        }

        const file = await filesService.getOne(fileId);

        // we log to the console so that is possible
        // to check that saving has triggered this wopi endpoint
        if (req.body) {
            var minioClient = new minio.Client({
                endPoint: process.env.MINIO_DOMAIN,
                port: +(process.env.MINIO_API_PORT),
                useSSL: process.env.MINIO_PROTOCOL == 'https',
                accessKey: process.env.MINIO_ACCESS_KEY,
                secretKey: process.env.MINIO_SECRET_KEY
            });
            minioClient.putObject(req.params.workspaceId, file.modified_name, req.body, (error) => {
                if (error) {
                    return res.status(500).json({
                        message: 'Error getting file.',
                        error: error
                    });
                }
                res.sendStatus(200);
            });
        } else {
            return sendError(res, new Error('Not possible to get the file content.'), 'Not possible to get the file content.', 404);
        }
    }
}
