import { Auths } from './auth';
import { sendErr } from './sendError';
import { hasProperty } from './helperFunctions';
import { userFileHandler } from "./filehandler";
import { Password } from './password';
import { config } from './proxy'

export {

    // AUTHS
    Auths as Auths,

    // SEND ERROR
    sendErr as sendError,

    // HAS PROPERTY
    hasProperty as hasProperty,

    // USER FILEHANDLER
    userFileHandler as userFileHandler,

    Password as PasswordHelper,

    // PROXY CONFIGS
    config as config
}