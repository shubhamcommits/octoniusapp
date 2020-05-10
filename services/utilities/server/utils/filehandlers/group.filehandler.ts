import { Response, Request, NextFunction } from "express";
import { sendError } from "../senderror";

/**
 * This function is the boiler plate for file handler mechanism for group avatar
 * @param req 
 * @param res 
 * @param next 
 */
const groupFileHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {

    // Fetch the File Name From the request
    let { params: { file } } = req;

    // Redirect the Response to the Groups Microservice
    return res.status(301).redirect(`${process.env.GROUPS_SERVER}/uploads/${file}`)

  } catch (err) {
    return sendError(res, err, 'Internal Server Error!', 500);
  }
}

export { groupFileHandler }
