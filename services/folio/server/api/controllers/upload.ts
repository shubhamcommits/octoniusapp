import {Request, Response, NextFunction } from 'express';
import path from 'path';
import {createHtml} from '../../utils/folio/upload-docx-utils';
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './uploads'
});

const uploadcontroller = async (req: any, res) =>{
    let file_path = "";
    if ( req.files.uploads.length >=1 ) {
        file_path = './'+req.files.uploads[0].path;
        file_path = './uploads/'+path.basename(file_path);
    }
    const htmlData = await createHtml(file_path, res);
}

export default {uploadcontroller, multipartMiddleware};