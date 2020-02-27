import bcrypt from 'bcryptjs';

export class Password {

    /**
     * This function encrypts the password and returns with a promise
     * @param password 
     */
    encryptPassword(password: string) {
        return new Promise((resolve, reject) => {
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
    }

    /**
     * This function decrypts the password and returns with a promise
     * @param plainPassword 
     * @param hash 
     */
    decryptPassword(plainPassword: string, hash: any) {
        return new Promise((resolve, reject) => {
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
    }
}
