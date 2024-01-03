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
import { Lounge } from './lounge.model';
import { Story } from './story.model';
import { Entity } from './entity.model';
import { Holiday } from './holidays.model';
import { Contact } from './contact.model';
import { Company } from './company.model';

/*  =====================
 *  -- EXPORTS MODELS --
 *  =====================
 * */
export {

    // AUTH
    Auth as Auth,

    Holiday as Holiday,

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

    Company as Company,
    Contact as Contact,

    // FLOW
    Flow as Flow,

    // NOTIFICATION
    Notification as Notification,

    // POST
    Post as Post,

    // Lounge
    Lounge as Lounge,

    // Story
    Story as Story,

    Entity as Entity
};