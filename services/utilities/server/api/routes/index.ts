import { authRoutes } from './auths.routes';
import { fileHandlerRoutes } from "./filehandler.routes";
import { filesRoutes } from './files.routes';
import { foldersRoutes } from './folders.routes';

/*  =====================
 *  -- EXPORTS ROUTES --
 *  =====================
 * */
export {

    // Auth Routes
    authRoutes as authRoutes,

    // Files Handler Routes
    fileHandlerRoutes as fileHandlerRoutes,

    // Files Routes
    filesRoutes as filesRoutes,

    // Folders Routes
    foldersRoutes as foldersRoutes
}