import { IntegrationController } from "./integration.controller";
import { LdapController } from "./ldap.controller";
import { SlackController } from "./slack.controller";
import { TeamsController } from "./teams.controller";
import { ZapierController } from './zapier.controller';
import { BoxControllers } from './box.controller';

/*  ==========================
 *  -- CONTROLLERS EXPORTS --
 *  ==========================
 * */
export {
    IntegrationController as IntegrationController,
    SlackController as SlackController,
    TeamsController as TeamsController,
    ZapierController as ZapierController,
    LdapController as LdapController,
    BoxControllers as BoxControllers
}