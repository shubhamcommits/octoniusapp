const postFileHandler = (req, res, next) => {

  if (!req.files) {
    next();
    req.body.files = null;

    // multiple files attached with post
  } else if (req.files.attachments.length > 1) {
    req.body.files = [];
    req.files.attachments.forEach((currentFile, index) => {
      let fileName = Date.now().toString() + currentFile.name;
      const folder = process.env.FILE_UPLOAD_FOLDER;

      currentFile.mv(folder + fileName, (error) => {
        if (error) {
          fileName = null;
          return res.status(500).json({
            status: '500',
            message: 'file upload error',
            error
          });
        }
      });

      const f = {
        orignal_name: currentFile.name,
        modified_name: fileName
      };

      req.body.files.push(f);
    });
    next();

    // single file attached with post
  } else {
    let fileName = Date.now().toString() + req.files.attachments.name;
    const file = req.files.attachments;
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

      req.body.files = [];
      const f = {
        orignal_name: req.files.attachments.name,
        modified_name: fileName
      };

      req.body.files.push(f);
      console.log('reached end file upload', req.body.files);
      next();
    });
  }
};

module.exports = postFileHandler;
