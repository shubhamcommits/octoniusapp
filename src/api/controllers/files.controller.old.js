const path = require('path');

const downloadFile = (req, res, next) => {
  const { fileName } = req.body;
  const filepath = `${path.join(__dirname, '../uploads')}/${fileName}`;

  res.sendFile(filepath);
};

module.exports = { downloadFile };
