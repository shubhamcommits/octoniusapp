import { Response, Request, NextFunction } from "express";
import { Auths } from '../../utils/auths';
import { sendError } from "../../utils/senderror";
import { FilesService } from "../services";
import { User } from "../models";
import moment from "moment";

let http = require('http');
let https = require('https');
let Dom = require('xmldom').DOMParser;
let xpath = require('xpath');
const fs = require('fs');
const path = require('path');

// Create instance of files service
let filesService = new FilesService();
let authsHelper = new Auths();

export class LibreofficeControllers {

    async libreofficeUrl(req, res) {
        try {
            let libreofficeOnlineHost = process.env.LIBREOFFICE_SERVER;
            let httpClient = libreofficeOnlineHost.startsWith('https') ? https : http;
            let data = '';
            let request = httpClient.get(libreofficeOnlineHost + '/hosting/discovery', (response) => {
                response.on('data', (chunk) => { data += chunk.toString(); });
                response.on('end', () => {
                    let err;
                    if (response.statusCode !== 200) {
                        err = 'Request failed. Satus Code: ' + response.statusCode;
                        response.resume();
                        console.log(err)
                        return sendError(res, new Error(err), err, response.statusCode);
                    }
                    if (!response.complete) {
                        err = 'No able to retrieve the discovery.xml file from the Libreoffice Online server with the submitted address.';
                        console.log(err);
                        return sendError(res, new Error(err), err, 404);
                    }
                    let doc = new Dom().parseFromString(data);
                    if (!doc) {
                        err = 'The retrieved discovery.xml file is not a valid XML file'
                        console.log(err);
                        return sendError(res, new Error(err), err, 404);
                    }
                    let mimeType = 'text/plain';
                    let nodes = xpath.select("/wopi-discovery/net-zone/app[@name='" + mimeType + "']/action", doc);
                    if (!nodes || nodes.length !== 1) {
                        err = 'The requested mime type is not handled'
                        console.log(err);
                        return sendError(res, new Error(err), err, 404);
                    }

                    let onlineUrl = nodes[0].getAttribute('urlsrc');
                    onlineUrl = onlineUrl.replace("http:", "https:");
                    res.json({
                        url: onlineUrl,
                    });
                });
                response.on('error', function(err) {
                    console.log('Request error: ' + err.message);
                    return sendError(res, err, 'Request error: ' + err.message, 404);
                });
            });
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
                        if (moment.utc(f1.created_date).isBefore(f2.created_date)) {
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
            const user = await User.findById({ _id: userId }).lean();
console.log(fileLastVersion?._posted_by);
console.log(fileLastVersion?._parent);
console.log(user);
            let canEdit;
            if (fileLastVersion._parent || fileLastVersion?._id == fileId) {
                canEdit = await authsHelper.canUserEditFileAction(fileLastVersion, user, fileId);
            } else {
                canEdit = false;
            }
            
            return res.json({
                BaseFileName: fileLastVersion.original_name,
                OwnerId: fileLastVersion?._posted_by?._id || fileLastVersion?._posted_by,
                UserId: user._id || '',
                UserFriendlyName: user.first_name + ' ' + user.last_name,
                UserExtraInfo: {
                    avatar: process.env.UTILITIES_USERS_UPLOADS + '/' + user.profile_pic + '?noAuth=true',
                    mail: user.email
                },
                UserCanWrite: canEdit,
                UserCanNotWriteRelative: true, // to show Save As button
                HidePrintOption: true,
                DisableExport: true,
                SupportsUpdate: true,
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /* *
    *  wopi GetFile endpoint
    *
    *  Given a request access token and a document id, sends back the contents of the file.
    *  The GetFile wopi endpoint is triggered by a request with a GET verb at
    *  https://HOSTNAME/wopi/files/<document_id>/contents
    */
    async getFile(req, res) {
        const fileId = req.params.fileId;

        if (!fileId) {
            return sendError(res, new Error('Please pass the fileId in the request params.'), 'Please pass the fileId in the request params.', 400);
        }

        const file = await filesService.getOne(fileId);

        if (file) {
            const fileBuffer = fs.readFileSync(`${process.env.FILE_UPLOAD_FOLDER}/${file.modified_name}`);
            res.send(fileBuffer);
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
    *  https://HOSTNAME/wopi/files/<document_id>/contents
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
            var wstream = fs.createWriteStream(`${process.env.FILE_UPLOAD_FOLDER}${file.modified_name}`);
            wstream.write(req.body);
            res.sendStatus(200);
        } else {
            return sendError(res, new Error('Not possible to get the file content.'), 'Not possible to get the file content.', 404);
        }
    }
}
