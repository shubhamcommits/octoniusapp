const bcrypt = require('bcrypt');
module.exports = {

	encryptPassword(password) {
		return new Promise(function (resolve, reject) {
			bcrypt.hash(password, 10, (hashError, hashPassword) => {
				if (hashError) {
					reject({
						message: 'Error encrypting password!',
						error: hashError,
						password
					});
				} else {
					resolve({
						message: 'Password encrypted!',
						password: hashPassword
					});
				}
			});
		})
	},

	decryptPassword(plainPassword, hash) {
		return new Promise(function (resolve, reject) {
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
		})
	}
}
