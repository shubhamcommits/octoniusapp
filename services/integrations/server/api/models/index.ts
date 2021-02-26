import { Auth } from './auth.model';
import { Account } from './account.model';
import { Column } from './column.model';
import { Flow } from './flow.model';
import { Group } from './group.model';
import { Post } from './post.model';
import { User } from './user.model';
import { Workspace } from './workspace.model';
import { SlackAuth } from './slack.model';

/*  =====================
 *  -- EXPORTS MODELS --
 *  =====================
 * */
export {

    // AUTH
    Auth as Auth,

    // Account
    Account as Account,

    // COLUMN
    Column as Column,

    // GROUP
    Group as Group,

    // POST
    Post as Post,

    // USER
    User as User,

    // WORKSPACE
    Workspace as Workspace,

    // FLOW
    Flow as Flow,

    //SLACK AUTH

    SlackAuth as SlackAuth
};