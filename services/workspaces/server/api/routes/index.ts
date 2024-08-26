import { domainRoutes } from './domains.routes';

import { workspaceRoutes } from './workspaces.routes';
import { memberRoutes } from './member.routes';
import { mgmtRoutes } from './mgmt.routes';
import { storiesRoutes } from './stories.routes';
import { loungesRoutes } from './lounges.routes';
import { hrRoutes } from './hr.routes';
import { crmRoutes } from './crm.routes';

/*  =====================
 *  -- EXPORTS ROUTES --
 *  =====================
 * */
export {
    crmRoutes as crmRoutes,
    memberRoutes as memberRoutes,
    domainRoutes as domainRoutes,
    workspaceRoutes as workspaceRoutes,
    mgmtRoutes as mgmtRoutes,
    loungesRoutes as loungesRoutes,
    storiesRoutes as storiesRoutes,

    hrRoutes as hrRoutes
}