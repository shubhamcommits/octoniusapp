import { CommonService } from "./common.services";
import { ManagementService } from "./management.service";
import { NotificationsService } from "./notifications.service";
import { UsersService } from "./users.service";
import { WorkspaceService } from "./workspaces.service";

/*  =======================
 *  -- EXPORTS SERVICES --
 *  =======================
 * */
export {

    // Users Service
    UsersService as UsersService,

    // Groups Service
    CommonService as CommonService,

    // Workspaces Service
    WorkspaceService as WorkspaceService,

    // Management Service
    ManagementService as ManagementService,
    NotificationsService as NotificationsService
}