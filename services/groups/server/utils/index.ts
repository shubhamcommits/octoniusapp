import { Auths } from './auth';
import { sendErr } from './sendError';
import { hasProperty } from './helperFunctions';
import { groupUploadFileHandler } from './filehandler';
import { axios } from './proxy'

export {
    Auths as Auths,
    sendErr as sendError,
    hasProperty as hasProperty,
    groupUploadFileHandler as groupUploadFileHandler,

    // PROXY CONFIGS
    axios as axios
}