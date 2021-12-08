import { domainRoutes } from './domains.routes';

import { workspaceRoutes } from './workspaces.routes';
import { memberRoutes } from './member.routes';
import { mgmtRoutes } from './mgmt.routes';
import { storiesRoutes } from './stories.routes';
import { loungesRoutes } from './lounges.routes';

/*  =====================
 *  -- EXPORTS ROUTES --
 *  =====================
 * */
export {

    // MEMBERS
    memberRoutes as memberRoutes,

    // DOMAINS
    domainRoutes as domainRoutes,

    // WORKSPACES
    workspaceRoutes as workspaceRoutes,

    // MODULES
    mgmtRoutes as mgmtRoutes,

    // Lounges
    loungesRoutes as loungesRoutes,

    // Lounges
    storiesRoutes as storiesRoutes,
}