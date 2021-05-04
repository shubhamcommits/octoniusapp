import { flamingoFileHandler } from "./flamingo.filehandler";
import { groupFileHandler } from "./group.filehandler";
import { postFileHandler } from "./post.filehandler";
import { userFileHandler } from "./user.filehandler";
import { workspaceFileHandler } from "./workspace.filehandler";

/*  =========================
 *  -- EXPORT FILEHANDLER --
 *  =========================
 * */
export {

  // GROUP
  groupFileHandler as groupFileHandler,

  // POST
  postFileHandler as postFileHandler,

  // USER
  userFileHandler as userFileHandler,

  // WORKSPACE
  workspaceFileHandler as workspaceFileHandler,

  // FLAMINGO
  flamingoFileHandler as flamingoFileHandler

}