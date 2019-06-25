const bcrypt = require('bcrypt');

// !!Refactor both helpers!!

const encryptPassword = password => new Promise((resolve, reject) => {
  bcrypt.hash(password, 10, (error, hashPassword) => {
    if (error) {
      reject({
        message: 'Error encrypting password!',
        error,
        password
      });
    } else {
      resolve({
        message: 'Password encrypted!',
        password: hashPassword
      });
    }
  });
});

const decryptPassword = (plainPassword, hash) => new Promise((resolve, reject) => {
  bcrypt.compare(plainPassword, hash, (hashError, password) => {
    if (hashError) {
      reject({
        message: 'Password decryption error!',
        error: hashError,
        password
      });
    } else {
      resolve({
        message: 'Password decrypted!',
        password
      });
    }
  });
});

module.exports = { encryptPassword, decryptPassword };
