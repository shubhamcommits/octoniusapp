import { Auths } from './auth';
import { sendErr } from './sendError';
import { hasProperty } from './helperFunctions';
import { userFileUploader } from "./filehandler";
import { Password } from './password';
import { axios } from './proxy'

export {

    // AUTHS
    Auths as Auths,

    // SEND ERROR
    sendErr as sendError,

    // HAS PROPERTY
    hasProperty as hasProperty,

    // USER FILEHANDLER
    userFileUploader as userFileUploader,

    Password as PasswordHelper,

    // PROXY CONFIGS
    axios as axios
}