import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { Auth, Workspace } from "../api/models";
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
            let { mgmtApiPrivateKey } = req.query;

            // Authorization header is not present on request
            if (!req.headers.authorization && !mgmtApiPrivateKey) {
                return res.status(401).json({
                    message: 'Unauthorized request, it must include an authorization header!'
                });
            }

            if (req.headers.authorization) {
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
            } else if (mgmtApiPrivateKey) {
              next();
            }
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
            let { mgmtApiPrivateKey } = req.query;
            
            if (!req.headers.authorization && mgmtApiPrivateKey) {
              next();
            } else {

              const auth = await Auth.findOne({
                  _user: req['userId'],
                  isLoggedIn: true,
                  token: req.headers.authorization.split(' ')[1]
              });

              if (!!auth) {
                  next();
              }
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
                        message: 'Unable to log the auth record creation, some unexpected error occurred!',
                        error: new Error('Unable to log the auth record creation, some unexpected error occurred!')
                    })
                })

            // Error on auth creation
            if (!auth) {
                reject({
                    message: 'Unable to log the auth record creation, some unexpected error occurred!',
                    error: new Error('Unable to log the auth record creation, some unexpected error occurred!')
                })
            }

            // Resolve the promise with token
            resolve({
                message: 'Token generated successfully!',
                token: token
            })
        })
    }

    /**
     * This function is responsible for signing out a user
     * @param req 
     * @param res 
     * @param next 
     */
    async signOut(req: Request, res: Response, next: NextFunction) {
        try {

            req['userId'] = '';
            req.headers.authorization = undefined

            // Send the status 200 response 
            return res.status(200).json({
                message: 'User logged out!',
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This method is used to generate a random Access Code for each workspace
     */
    async generateWorkspaceAccessCode() {
        const resultLength = 6;
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for ( var i = 0; i < resultLength; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    /**
     * This method is used to generate a random API Key for each workspace to send information to mgmt portal
     */
    async generateMgmtPrivateApiKey() {
        const resultLength = 20;
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for ( var i = 0; i < resultLength; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    /**
     * This function verifies the API key coming from the request authorization headers
     * @param req 
     * @param res 
     * @param next 
     */
    async verifyMgmtAPIKey(req: Request, res: Response, next: NextFunction) {
        try {
            // Authorization header is not present on request
            
            const { API_KEY } = req.body;
            const { params: { workspaceId } } = req;

            if (!API_KEY) {
                return res.status(401).json({
                    message: 'Unauthorized request, it must include an API key!'
                });
            }

            // Find the workspace based on the workspaceId and the API_KEY
            const workspace = await Workspace.find({
                $and: [
                    { _id: workspaceId },
                    { management_private_api_key: API_KEY},
                ]
            }).select('management_private_api_key');
            
            // If there is no workspace matching the api key and the id send error
            if (!workspace) {
                return sendError(res, new Error('Wrong API key!'), 'Please include a valid API key!', 401);
            } else {
                next();
            }            
        } catch (err) {
            return sendError(res, err);
        }
    }
}