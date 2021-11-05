import { fileHandlerRoutes } from "./filehandler.routes";
import { filesRoutes } from './files.routes';
import { foldersRoutes } from './folders.routes';
import { foldersPermissionsRoutes } from './folders-permissions.routes';
import { filesPermissionsRoutes } from './files-permissions.routes';

/*  =====================
 *  -- EXPORTS ROUTES --
 *  =====================
 * */
export {

    // Auth Routes
    // authRoutes as authRoutes,

    // Files Handler Routes
    fileHandlerRoutes as fileHandlerRoutes,

    // Files Routes
    filesRoutes as filesRoutes,

    // Folders Routes
    foldersRoutes as foldersRoutes,

    // Folders Permissions Routes
    foldersPermissionsRoutes as foldersPermissionsRoutes,

    // Files Permissions Routes
    filesPermissionsRoutes as filesPermissionsRoutes
}