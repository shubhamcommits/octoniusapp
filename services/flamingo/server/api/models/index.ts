import { Auth } from './auth.model';
import { Account } from './account.model';
import { Column } from './column.model';
import { Flow } from './flow.model';
import { Group } from './group.model';
import { Post } from './post.model';
import { User } from './user.model';
import { Workspace } from './workspace.model';
import { Comment } from './comment.model';
import { Notification } from './notification.model';
import { Flamingo } from './flamingo.model';
import { Answer } from './answers.model';
import { Question } from './questions.model';
import { File } from './file.model';
import { Folder } from './folder.model';
import { Story } from "./story.model";
import { Contact } from './contact.model';
import { Company } from './company.model';
import { TimeTrackingEntity } from './time_tracking_entity.model';

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

    // FILE
    File as File,
    
    // FOLDER
    Folder as Folder,

    // FLOW
    Flow as Flow,

    // COMMENT
    Comment as Comment,

    Company as Company,
    Contact as Contact,

    // NOTIFICATION 
    Notification as Notification,

    //FLAMINGO
    Flamingo as Flamingo,

    //ANSWER
    Answer as Answer,

    //QUESTION
    Question as Question,

    // Story
    Story as Story,
    TimeTrackingEntity as TimeTrackingEntity,
};