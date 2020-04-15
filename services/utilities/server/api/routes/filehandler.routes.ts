import express from 'express';
import { groupFileHandler, postFileHandler, userFileHandler, workspaceFileHandler } from '../../utils/filehandlers';
const multer = require("multer");

const routes = express.Router();

let folder = process.env.FILE_UPLOAD_FOLDER;
  console.log(folder);
  var Storage = multer.diskStorage({
    destination: folder,
    filename: function(req, file, callback) {
      callback(null, file.fieldname + "_" + Date.now() + '_' + file.originalname);
    }
  });

  var upload = multer({
    storage: Storage
  });

// POST - Handles the file attachment(group_avatar) for the groups
routes.post('/groups', groupFileHandler);

// POST - Handles the file attachments for the posts
routes.post('/posts', upload.array('files'), (req, res)=>{
    return res.status(200).json({
        message: `${req['files'].length} files uploaded!`
    });
});

// POST - Handles the file attachment(profileImage) for the user
routes.post('/users', userFileHandler);

// POST - Handles the file attachment(workspace_avatar) for the workspace
routes.post('/workspaces', workspaceFileHandler);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as fileRoutes }