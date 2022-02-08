import { Response, Request, NextFunction } from "express";
import { sendError } from "../../utils/senderror";
import { FilesService } from "../services";
import { User } from "../models";

let http = require('http');
let https = require('https');
let Dom = require('xmldom').DOMParser;
let xpath = require('xpath');
const fs = require('fs');

// Create instance of files service
let filesService = new FilesService();

export class LibreofficeControllers {

    async libreofficeUrl(req: Request, res: Response, next: NextFunction) {
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
                        res.status(response.statusCode).send(err);
                        console.log(err)
                        return;
                    }
                    if (!response.complete) {
                        err = 'No able to retrieve the discovery.xml file from the Libreoffice Online server with the submitted address.';
                        res.status(404).send(err);
                        console.log(err);
                        return;
                    }
                    let doc = new Dom().parseFromString(data);
                    if (!doc) {
                        err = 'The retrieved discovery.xml file is not a valid XML file'
                        res.status(404).send(err)
                        console.log(err);
                        return;
                    }
                    let mimeType = 'text/plain';
                    let nodes = xpath.select("/wopi-discovery/net-zone/app[@name='" + mimeType + "']/action", doc);
                    if (!nodes || nodes.length !== 1) {
                        err = 'The requested mime type is not handled'
                        res.status(404).send(err);
                        console.log(err);
                        return;
                    }

                    let onlineUrl = nodes[0].getAttribute('urlsrc');
                    res.json({
                        url: onlineUrl,
                        //token: 'test'
                    });
                });
                response.on('error', function(err) {
                    res.status(404).send('Request error: ' + err);
                    console.log('Request error: ' + err.message);
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
    async checkFileInfo(req: Request, res: Response, next: NextFunction) {
        const fileId = req.params.fileId;
        const userId = req['userId'];
        
        if (!fileId) {
            return res.status(400).json({
                message: 'Please pass the fileId in the request params'
            });
        }
        
        try {
            // Get File on the basis of the fileId
            const file = await filesService.getOne(fileId);

            if (!file) {
                return res.status(400).json({
                    message: 'File not found.'
                });
            }
            
            const user = await User.findById({ _id: userId }).lean();

            let canEdit = (file?.approval_flow_launched) ? !file?.approval_flow_launched : true;
            
            return res.json({
                BaseFileName: file.original_name,
                //Size: fileSize,
                UserId: user._id || '',
                OwnerId: file._posted_by._id || file._posted_by,
                //UserFriendlyName: user.username,
                UserCanWrite: canEdit,
                UserCanNotWriteRelative: true,  // to show Save As button
                SupportsUpdate: true,
                //PostMessageOrigin: 'http://192.168.1.144:8000',
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
    async getFile(req: Request, res: Response, next: NextFunction) {
        const fileId = req.params.fileId;

        if (!fileId) {
            return res.status(400).json({
                message: 'Please pass the fileId in the request params'
            });
        }

        const file = await filesService.getOne(fileId);

        if (file) {
            const fileBuffer = fs.readFileSync(`${process.env.FILE_UPLOAD_FOLDER}/uploads/${file.modified_name}`);
            res.send(fileBuffer);
        } else {
            // we just return the content of a fake text file
            // in a real case you should use the file id
            // for retrieving the file from the storage and
            // send back the file content as response
            let fileContent = 'Hello world!';
            res.send(fileContent);
        }
    }

    /* *
    *  wopi PutFile endpoint
    *
    *  Given a request access token and a document id, replaces the files with the POST request body.
    *  The PutFile wopi endpoint is triggered by a request with a POST verb at
    *  https://HOSTNAME/wopi/files/<document_id>/contents
    */
    async putFile(req: Request, res: Response, next: NextFunction) {
        let session = req.query.access_token;
        const fileId = req.params.fileId;

        if (!fileId) {
            return res.status(400).json({
                message: 'Please pass the fileId in the request params'
            });
        }

        //const file = await filesService.getOne(fileId);

        // we log to the console so that is possible
        // to check that saving has triggered this wopi endpoint
        console.log('wopi PutFile endpoint');
        //if (req.body && file) {
        if (req.body) {
            console.dir(req.body);
            console.log(req.body.toString());
            res.sendStatus(200);
        } else {
            console.log('Not possible to get the file content.');
            res.sendStatus(404);
        }
    }
}
