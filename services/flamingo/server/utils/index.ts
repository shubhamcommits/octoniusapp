import { sendErr } from './sendError';
import { Auths } from './auth';
import { flamingoFileHandler, flamingoFileUploader } from './flamingo.filehandler';
/*  =====================
 *  -- UTILS EXPORTS --
 *  =====================
 * */
export {
    
    sendErr as sendError,

    Auths as Auths,

    flamingoFileUploader as flamingoFileUploader,
    flamingoFileHandler as flamingoFileHandler
}