const workspaceFileHandler = (req, res, next) => {
  if (!req.files) {
    next();
  } else {
    let fileName = Date.now().toString() + req.files.workspace_avatar.name;
    const file = req.files.workspace_avatar;
    const folder = process.env.FILE_UPLOAD_FOLDER;

    file.mv(folder + fileName, (error) => {
      if (error) {
        fileName = null;
        return res.status(500).json({
          status: '500',
          message: 'file upload error',
          error
        });
      }

      req.body.workspace_avatar = fileName;
      next();
    });
  }
};

module.exports = workspaceFileHandler;
