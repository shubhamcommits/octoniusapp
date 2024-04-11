import { flamingoFileHandler } from "./flamingo.filehandler";
import { groupFileHandler, groupFileUploader, groupFileDelete, groupsFilesHandler, minioFileHandler, folioFileDelete } from "./group.filehandler";
import { postFileHandler } from "./post.filehandler";
import { userFileHandler } from "./user.filehandler";
import { utilitiesFileHandler } from "./utilities.filehandler";
import { workspaceFileHandler } from "./workspace.filehandler";

/*  =========================
 *  -- EXPORT FILEHANDLER --
 *  =========================
 * */
export {
  groupFileHandler as groupFileHandler,
  postFileHandler as postFileHandler,
  userFileHandler as userFileHandler,
  workspaceFileHandler as workspaceFileHandler,
  flamingoFileHandler as flamingoFileHandler,
  groupsFilesHandler as groupsFilesHandler,
  groupFileDelete as groupFileDelete,
  groupFileUploader as groupFileUploader,
  folioFileDelete as folioFileDelete,
  minioFileHandler as minioFileHandler,
  utilitiesFileHandler as utilitiesFileHandler
}
