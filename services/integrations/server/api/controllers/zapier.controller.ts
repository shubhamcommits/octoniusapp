import { Response, Request, NextFunction } from "express";
import { User} from '../models'

/*  ===============================
 *  -- Zapier CONTROLLERS --
 *  ===============================
 */

export class ZapierController {

    /** 
     * This function is auth the zapier with octonius
     * @param req 
     * @param res 
     * @param next 
    */
     async auth (req: Request ,res:Response ,next: NextFunction) {
         // Find user with id
         const user = await User.findById(req.body.userId);

         //Integrations object from user
         var integration = user['integrations'];
         //Update the is_zapier_connected to true
         integration['is_zapier_connected'] = true;
 
         try {
             //Update user integrations
             const update_user = await User.findOneAndUpdate({ _id: user._id },
                 { $set: { integrations: integration }},
                 { new: true });
             
             res.status(200).json({message:"Successfully",update_user});
 
         } catch (error) {
             console.log("error", error);
             res.status(200).json({message:"Error Occured faild",});
         }
    }
}
