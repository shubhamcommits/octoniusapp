import { Auths } from './auth';
import { Password } from './password';
import { sendErr } from './sendError';
import { companyFileUploader, fileHandler, loungeImageFileUploader, workspaceFileUploader } from "./filehandler";
import { axios } from './proxy'

/*  =====================
 *  -- UTILS EXPORTS --
 *  =====================
 * */
export {
    Auths as Auths,
    Password as PasswordHelper,
    sendErr as sendError,
    workspaceFileUploader as workspaceFileUploader,
    loungeImageFileUploader as loungeImageFileUploader,
    fileHandler as fileHandler,
    companyFileUploader as companyFileUploader,
    axios as axios
}