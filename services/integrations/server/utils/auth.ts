import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { Auth } from "../api/models";
import { Request, Response, NextFunction } from 'express';
import { sendError } from ".";

export class Auths {

    /**
     * This function verifies the token coming from the request authorization headers
     * It returns and feeds the userId into req object for future use
     * @param req 
     * @param res 
     * @param next 
     */
    async verifyToken(req: Request, res: Response, next: NextFunction) {
        try {

            // Authorization header is not present on request
            if (!req.headers.authorization) {
                return res.status(401).json({
                    message: 'Unauthorized request, it must include an authorization header!'
                });
            }

            // Split the authorization header
            const token = req.headers.authorization.split(' ')[1];

            // Token is not present on authorization header
            if (!token) {
                return res.status(401).json({
                    message: 'Unauthorized request, it must include an authorization token!'
                });
            }

            // Verify the token
            jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
                if (err || !decoded) {
                    return res.status(401).json({
                        message: 'Unauthorized request, it must have a valid authorization token!'
                    });
                } else {
                    // Assigning and feeding the userId into the req object
                    req['userId'] = decoded['subject'];
                    next();
                }
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function verifies if a user is currently loggedIn or not
     * @param req 
     * @param res 
     * @param next 
     */
    async isLoggedIn(req: Request, res: Response, next: NextFunction) {
        try {
            const auth = await Auth.findOne({
                _user: req['userId'],
                isLoggedIn: true,
                token: req.headers.authorization.split(' ')[1]
            });

            if (!!auth) {
                next();
            }

        } catch (err) {
            return sendError(res, err, 'Unauthorized request, Please sign In to continue!', 401)
        }
    };

    /**
     * This function generates the new jwt token and logs the authentication record 
     * @param user 
     * @param workspace_name 
     */
    async generateToken(user: any, workspace_name: string) {

        return new Promise(async (resolve, reject) => {

            // Generate token payload
            const payload = {
                subject: user._id
            };

            // Creating token
            const token = jwt.sign(payload, process.env.JWT_KEY);

            // Throw and catch the jwt error
            if (!token) {
                reject({
                    message: 'Unable to generate the token!',
                    error: new Error('Unable to generate the token!')
                })
            }

            // Initialize new auth record
            const newAuth = {
                workspace_name: workspace_name,
                _user: user._id,
                token: token
            };

            // Create new auth record
            const auth = await Auth.create(newAuth)
                .catch(() => {
                    reject({
                        message: 'Unable to log the auth record creation, some unexpected error occured!',
                        error: new Error('Unable to log the auth record creation, some unexpected error occured!')
                    })
                })

            // Error on auth creation
            if (!auth) {
                reject({
                    message: 'Unable to log the auth record creation, some unexpected error occured!',
                    error: new Error('Unable to log the auth record creation, some unexpected error occured!')
                })
            }

            // Resolve the promise with token
            resolve({
                message: 'Token generated successfully!',
                token: token
            })
        })
    }

}