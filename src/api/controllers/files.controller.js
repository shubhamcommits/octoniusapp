const downloadFile = (req, res, next) => {
  const { fileName } = req.body;
  const filepath = `${process.env.FILE_UPLOAD_FOLDER}/uploads/${fileName}`;

  res.sendFile(filepath);
};

module.exports = { downloadFile };
