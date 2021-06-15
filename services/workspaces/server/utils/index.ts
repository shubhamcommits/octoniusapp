import { Auths } from './auth';
import { Password } from './password';
import { sendErr } from './sendError';
import { workspaceFileHandler } from "./filehandler";
import { axios } from './proxy'

/*  =====================
 *  -- UTILS EXPORTS --
 *  =====================
 * */
export {
    
    // AUTHS
    Auths as Auths,

    // PASSWORDS
    Password as PasswordHelper,

    // SEND ERROR
    sendErr as sendError,

    // WORKSPACE FILE HANDLER
    workspaceFileHandler as workspaceFileHandler,

    // PROXY CONFIGS
    axios as axios
}