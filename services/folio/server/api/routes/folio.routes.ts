import express from 'express';
import { Auths } from '../../utils/auths';

import folio from '../controllers/folio.controller';

const routes = express.Router();

// Auths Helper Function
const authsHelper = new Auths();

routes.post('/upload', authsHelper.verifyToken, authsHelper.isLoggedIn, folio.createUploadFolder, folio.multipartMiddleware, folio.uploadcontroller);

routes.put('/:fileId/displayHeadings', authsHelper.verifyToken, authsHelper.isLoggedIn, folio.displayHeadings);

export default routes;