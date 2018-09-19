const fileHandler = (req, res, next) => {
  let fileName = Date.now().toString() + req.files.profileImage.name;
  const file = req.files.profileImage;
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
    req.fileName = fileName;
    next();
  });
};

module.exports = fileHandler;
