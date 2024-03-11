import { Account } from "./account.model";
import { Auth } from './auth.model';
import { User } from './user.model';
import { Folder } from './folder.model';
import { File } from './file.model';
import { Group } from './group.model';
import { Flamingo } from "./flamingo.model";
import { Question } from "./questions.model";
import { Workspace } from "./workspace.model";
import { TimeTrackingEntity } from "./time_tracking_entity.model";
import { Resource } from "./resource.model";

/*  =====================
 *  -- EXPORTS MODELS --
 *  =====================
 * */
export {

    // Account

    // Auths
    Auth as Auth,
    
    // Files
    File as File,
    
    // Group
    Group as Group,
    
    // Folders
    Folder as Folder,

    // Users
    User as User,

    // Flamingo
    Flamingo as Flamingo,

    // Question
    Question as Questions,

    Workspace as Workspace,
    TimeTrackingEntity as TimeTrackingEntity,
    Resource as Resource
};