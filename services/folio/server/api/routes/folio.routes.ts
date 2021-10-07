import express from 'express';
import upload from '../controllers/upload';
import { createUploadFolder} from '../../utils/folio/upload-docx-utils';
const routes = express.Router();

routes.post('/upload',createUploadFolder, upload.multipartMiddleware, upload.uploadcontroller);

export default routes;