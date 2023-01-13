import { Auths } from './auth';
import { sendErr } from './sendError';
import { hasProperty } from './helperFunctions';
import { fileHandler, groupUploadFileUpload, portfolioUploadFileUpload } from './filehandler';
import { axios } from './proxy'

export {
    Auths as Auths,
    sendErr as sendError,
    hasProperty as hasProperty,
    groupUploadFileUpload as groupUploadFileUpload,
    portfolioUploadFileUpload as portfolioUploadFileUpload,
    fileHandler as fileHandler,
    // PROXY CONFIGS
    axios as axios
}