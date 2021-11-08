import { FilesControllers } from './files.controllers';
import { FoldersControllers } from './folders.controllers';
import { FoldersPermissionsControllers } from './folders-permissions.controllers';
import { FilesPermissionsControllers } from './files-permissions.controllers';

/*  =====================
 *  -- EXPORTS ROUTES --
 *  =====================
 * */
export {

    // Files Controller
    FilesControllers as FilesController,

    // Folders Controller
    FoldersControllers as FoldersController,

    // Folder Permissions Controller
    FoldersPermissionsControllers as FoldersPermissionsControllers,

    // Files Permissions Controller
    FilesPermissionsControllers as FilesPermissionsControllers
}