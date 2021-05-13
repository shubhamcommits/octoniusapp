import { Response, Request, NextFunction } from "express";
import { sendError } from "../senderror";

/**
 * This function is the boiler plate for file handler mechanism for workspace avatar
 * @param req 
 * @param res 
 * @param next 
 */
const flamingoFileHandler = (req: Request, res: Response, next: NextFunction) => {
  try {

    // Fetch the File Name From the request
    let { params: { file } } = req;

    // Redirect the Response to the Workspaces Microservice
    return res.status(301).redirect(`${process.env.FLAMINGO_SERVER}/uploads/${file}`);
  } catch (err) {
    return sendError(res, err, 'Internal Server Error!', 500);
  }
}

export { flamingoFileHandler }
