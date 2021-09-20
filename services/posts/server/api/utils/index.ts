import { Auths } from './auth';
import { sendErr } from './sendError';
import { postFileHandler } from "./filehandler";
import { commentFileHandler } from './commentFileHandler';
import { axios } from './proxy';

export {

    // AUTHS
    Auths as Auths,

    // SEND ERROR
    sendErr as sendError,

    // POST FILEHANDLER
    postFileHandler as postFileHandler,

    // COMMENT FILEHANDLER
    commentFileHandler as commentFileHandler,

    // PROXY CONFIGS
    axios as axios
}