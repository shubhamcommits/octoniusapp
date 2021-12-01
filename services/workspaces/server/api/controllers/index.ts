import { DomainsControllers } from "./domains.controllers";
import { LoungeController } from "./lounges.controllers";
import { MembersControllers } from "./members.controllers";
import { WorkspaceController } from "./workspaces.controller";

/*  =========================
 *  -- EXPORTS CONTROLLERS --
 *  =========================
 * */
export {

    // DOMAINS
    DomainsControllers as DomainControllers,

    // MEMBERS
    MembersControllers as MemberControllers,

    // WORKSPACES
    WorkspaceController as WorkspaceController,

    // lounges
    LoungeController as LoungeController
}