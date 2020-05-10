import { Response, Request, NextFunction } from "express";
import { sendError } from "../senderror";

/**
 * This function is the boiler plate for file handler mechanism for user post attachements
 * @param req 
 * @param res 
 * @param next 
 */
const postFileHandler = (req: Request, res: Response, next: NextFunction) => {
  try {

    // Fetch the File Name From the request
    let { params: { file } } = req;

    // Redirect the Response to the Posts Microservice
    return res.status(301).redirect(`${process.env.POSTS_SERVER}/uploads/${file}`)

  } catch (err) {
    return sendError(res, err, 'Internal Server Error!', 500);
  }
}

export { postFileHandler }
