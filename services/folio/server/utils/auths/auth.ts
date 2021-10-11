import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from 'express';
import { sendError } from "../senderror";
import { Auth } from "../../models";

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
}