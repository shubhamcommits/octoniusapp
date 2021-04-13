import { Response, Request, NextFunction } from "express";
import { sendError } from '../../utils';
import { FlamingoService } from "../service";

// Create instance of files service
let flamingoService = new FlamingoService();

// Creating Service class in order to build wrapper class

/*  ===============================
 *  -- FLAMINGO CONTROLLERS --
 *  ===============================
 */

export class FlamingoController {

    /** 
     * This function is responsible to flamingo form
     * @param req 
     * @param res 
     * @param next 
     */
    async createForm(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the File Name From the request

            let { body: { flamingoData } } = req;

            // Create the file
            flamingoData = await flamingoService.createForm(flamingoData);

            // Send Status 200 response
            return res.status(200).json({
                message: 'Form has been Created!',
                form: flamingoData
            });

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is used to fetch list of the forms
     * @param req 
     * @param res 
     * @param next 
     */
     async get(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the File Name From the request
            let { query: { groupId, lastFormId } } = req;

            // Files List
            let forms: any = [];

            // Get files list
            if (lastFormId == undefined || lastFormId == 'undefined') {
                forms = await flamingoService.get(groupId.toString(), null);  
            }else {
                forms = await flamingoService.get(groupId.toString(), lastFormId.toString());  
            }

            // Send Status 200 response
            return res.status(200).json({
                message: 'Forms list fetched!',
                forms: forms
            });

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }


}
