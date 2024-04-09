import { IntegrationController } from "./integration.controller";
import { LdapController } from "./ldap.controller";
import { SlackController } from "./slack.controller";
import { TeamsController } from "./teams.controller";
import { ZapierController } from './zapier.controller';
import { BoxControllers } from './box.controller';
import { GoogleController } from "./google.controller";
import { MSController } from "./ms.controller";

/*  ==========================
 *  -- CONTROLLERS EXPORTS --
 *  ==========================
 * */
export {
    BoxControllers as BoxControllers,
    IntegrationController as IntegrationController,
    GoogleController as GoogleController,
    LdapController as LdapController,
    MSController as MSController,
    SlackController as SlackController,
    TeamsController as TeamsController,
    ZapierController as ZapierController,
}