import { billingRoutes } from './billings.routes';
import { domainRoutes } from './domains.routes';

import { workspaceRoutes } from './workspaces.routes';
import { memberRoutes } from './member.routes';
import { mgmtRoutes } from './mgmt.routes';

/*  =====================
 *  -- EXPORTS ROUTES --
 *  =====================
 * */
export {

    // BILLINGS
    billingRoutes as billingRoutes,

    // MEMBERS
    memberRoutes as memberRoutes,

    // DOMAINS
    domainRoutes as domainRoutes,

    // WORKSPACES
    workspaceRoutes as workspaceRoutes,

    // MODULES
    mgmtRoutes as mgmtRoutes,
}