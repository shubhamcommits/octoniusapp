import { Account } from "./account.model";
import { Post } from './post.model';
import { User } from './user.model';
import { File } from './file.model';
import { Comment } from './comment.model';
import { Auth } from './auth.model';
import { Column } from './column.model';
import { Group } from "./group.model";
import { Workspace } from "./workspace.model";
import { Story } from "./story.model";
import { Notification } from "./notification.model";
import { Contact } from "./contact.model";
import { Company } from "./company.model";

/*  =====================
 *  -- EXPORTS MODELS --
 *  =====================
 * */
export {

    // Account
    Account as Account,

    // POST
    Post as Post,

    // USER
    User as User,

    // File
    File as File,

    // COMMENT
    Comment as Comment,

    Company as Company,
    Contact as Contact,

    // COLUMN
    Column as Column,

    // AUTH
    Auth as Auth,

    // Group
    Group as Group,

    // Workspace
    Workspace as Workspace,

    // Story
    Story as Story,

    // Notification
    Notification as Notification
};