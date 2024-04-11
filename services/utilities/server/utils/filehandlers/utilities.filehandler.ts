import { Response, Request, NextFunction } from "express";
import { sendError } from "../senderror";
import { Element, xml2js } from 'xml-js';
import { IncomingMessage, request as requestHttp } from 'http';
import { request as requestHttps } from 'https';

const minio = require('minio');
let Dom = require('xmldom').DOMParser;
let xpath = require('xpath');

/**
 * This function is the boiler plate for file handler mechanism for user profileImage
 * @param req 
 * @param res 
 * @param next 
 */
const utilitiesFileHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {

    // Fetch the File Name From the request
    let { params: { workspaceId, file } } = req;

    var minioClient = new minio.Client({
      endPoint: process.env.MINIO_DOMAIN,
      port: +(process.env.MINIO_API_PORT),
      useSSL: process.env.MINIO_PROTOCOL == 'https',
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY
    });

    await minioClient.getObject(workspaceId, /*process.env.FILE_UPLOAD_FOLDER + */file, async (error, data) => {
      if (error) {
        return res.status(500).json({
          message: 'Error getting file.',
          error: error
        });
      }

      data.pipe(res);
    });

  } catch (err) {
    return sendError(res, err, 'Internal Server Error!', 500);
  }

}

async function getWopiMethods(onlineHost: string, useMS365: boolean): Promise<any> {
  return new Promise((resolve, reject) => {
    const hostUrl = new URL(onlineHost);
    let data = '';
    const options = {
      host: hostUrl.hostname,
      path: '/hosting/discovery',
    };

    const callback = (response: IncomingMessage) => {
        // the whole response has been received, so respond
        response.on('data', (chunk) => { data += chunk.toString(); });
        response.on('end', () => {
            if (useMS365) {
                let str = '';
                const dataFromXml = xml2js(str, { compact: false }) as Element;
                const data: {[key: string]: [[string, string]]} = {};
                const implemented = process.env.WOPI_IMPLEMENTED?.split(',');

                dataFromXml.elements?.find((el: Element) => el.name === 'wopi-discovery')
                    ?.elements?.find((el: Element) => el.name === 'net-zone')
                        ?.elements?.forEach((el: Element) => {
                            el.elements?.forEach((el: Element) => {
                                if (el.attributes?.name && typeof(el.attributes?.name) === 'string') {
                                    if (implemented?.includes(el.attributes.name)) {
                                        const name = el.attributes.name;
                                        const splitUrl: string[] = (el.attributes.urlsrc)?.toString().split('?') ?? [];
                                        const queryParams = splitUrl[1].replace(/<.*>/, '').replace(/&$/, '');

                                        if (el.attributes?.ext) {
                                            if (!Object.prototype.hasOwnProperty.call(data, el.attributes?.ext)) {
                                                data[el.attributes.ext] = [[name, `${splitUrl[0]}?${queryParams}`]];
                                            } else {
                                                data[el.attributes.ext].push([name, `${splitUrl[0]}?${queryParams}`]);
                                            }
                                        }
                                    }
                                }
                            });
                    });

                resolve(data);

                // res.json({
                //     data: data,
                // });
                
            } else {
                let err;
                if (response.statusCode !== 200) {
                    err = 'Request failed. Satus Code: ' + response.statusCode;
                    response.resume();
                    console.log(err)
                    reject(new Error(err));
                    // return sendError(res, new Error(err), err, response.statusCode);
                }
                if (!response.complete) {
                    err = 'No able to retrieve the discovery.xml file from the Libreoffice Online server with the submitted address.';
                    console.log(err);
                    reject(new Error(err));
                    // return sendError(res, new Error(err), err, 404);
                }
                let doc = new Dom().parseFromString(data);
                if (!doc) {
                    err = 'The retrieved discovery.xml file is not a valid XML file'
                    console.log(err);
                    reject(new Error(err));
                    // return sendError(res, new Error(err), err, 404);
                }
                let mimeType = 'text/plain';
                let nodes = xpath.select("/wopi-discovery/net-zone/app[@name='" + mimeType + "']/action", doc);
                if (!nodes || nodes.length !== 1) {
                    err = 'The requested mime type is not handled'
                    console.log(err);
                    reject(new Error(err));
                    // return sendError(res, new Error(err), err, 404);
                }
                
                let onlineUrl = nodes[0].getAttribute('urlsrc');
                onlineUrl = onlineUrl.replace("http:", "https:");

                resolve(onlineUrl);
            }
        });

        response.on('error', function(error) {
            console.log('Request error: ' + error.message);
            reject(error);
            // return sendError(res, err, 'Request error: ' + err.message, 404);
        });
    }

    if (onlineHost.startsWith('https')) {
        requestHttp(options, callback).end();
    } else {
        requestHttps(options, callback).end();
    }
  });
}

export { utilitiesFileHandler, getWopiMethods }
