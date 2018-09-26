const downloadFile = (req, res, next) => {
  const { fileName } = req.body;
  const filepath = `${__dirname}/uploads/${fileName}`;

  res.sendFile(filepath);
};

module.exports = { downloadFile };
