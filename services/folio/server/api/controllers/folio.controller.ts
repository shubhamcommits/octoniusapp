import path from 'path';
import createHtml from '../../utils/folio/convert-to-html';
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './uploads'
});

const uploadcontroller = async (req: any, res) =>{
    let file_path = "";
    if ( req.files.uploads.length >=1 ) {
        file_path = path.resolve('./'+req.files.uploads[0].path);
    }
    const htmlData = await createHtml(file_path);
        res.json({
            "message": htmlData,
            "messages": "Html conversion success"
        });
}

export default {uploadcontroller, multipartMiddleware};