import { Auths } from './auth';
import { sendErr } from './sendError';
import { hasProperty } from './helperFunctions';
import { groupFileHandler } from './filehandler';
import { axios } from './proxy'

export {
    Auths as Auths,
    sendErr as sendError,
    hasProperty as hasProperty,
    groupFileHandler as groupFileHandler,

    // PROXY CONFIGS
    axios as axios
}