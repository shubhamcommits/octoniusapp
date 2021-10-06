const express = require('express')
const multipart = require('connect-multiparty');
const path = require('path');
const multipartMiddleware = multipart({
    uploadDir: './Trash'
});

const { createHtml } = require('../utils/convert-docs-to-htmll')

const router = express.Router()


router.get('/', (req, res) => {
    res.send("Hello From Octonius");
})


router.post('/', multipartMiddleware, async (req, res)=>{
    console.log("Call from: " + req.get('origin'));

    let file_path = "";
    if ( req.files.uploads.length >=1 ) {
        file_path = './'+req.files.uploads[0].path;
        file_path = './Trash/'+path.basename(file_path);
    }
    const htmlData = await createHtml(file_path, res);
})



module.exports = router;