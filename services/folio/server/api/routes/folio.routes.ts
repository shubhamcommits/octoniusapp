import express from 'express';
import upload from '../controllers/folio.controller';
const routes = express.Router();

routes.post('/upload', upload.multipartMiddleware, upload.uploadcontroller);

export default routes;