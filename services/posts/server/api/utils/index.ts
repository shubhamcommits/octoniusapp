import { Auths } from './auth';
import { sendErr } from './sendError';
import { fileHandler, postFileUploader } from "./filehandler";
import { commentFileUploader } from './commentFileHandler';

export {

    // AUTHS
    Auths as Auths,

    // SEND ERROR
    sendErr as sendError,

    // POST FILEHANDLER
    postFileUploader as postFileUploader,

    // COMMENT FILEHANDLER
    commentFileUploader as commentFileUploader,

    fileHandler as filehandler
}