import { Auth } from './auth.model';
import { Column } from './column.model';
import { Flow } from './flow.model';
import { Group } from './group.model';
import { Post } from './post.model';
import { User } from './user.model';
import { Notification } from './notification.model';
import { Workspace } from './workspace.model';
import { Comment } from './comment.model';
import { Account } from './account.model';

/*  =====================
 *  -- EXPORTS MODELS --
 *  =====================
 * */
export {

    // AUTH
    Auth as Auth,

    // GROUP
    Group as Group,

    // USER
    User as User,

    // ACCOUNT 
    Account as Account,

    // WORKSPACE
    Workspace as Workspace,

    // COLUMN
    Column as Column,

    // Comment
    Comment as Comment,

    // FLOW
    Flow as Flow,

    // NOTIFICATION
    Notification as Notification,

    // POST
    Post as Post
};