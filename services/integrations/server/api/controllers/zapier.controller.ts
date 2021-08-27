import { Response, Request, NextFunction } from "express";
import { User } from '../models'

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
    async auth(req: Request, res: Response, next: NextFunction) {
        // Find user with id
        const user = await User.findById(req.body.userId);

        //Integrations object from user
        var integration = user['integrations'];
        //Update the is_zapier_connected to true
        integration['is_zapier_connected'] = true;

        try {
            //Update user integrations
            const update_user = await User.findOneAndUpdate({ _id: user._id },
                { $set: { integrations: integration } },
                { new: true });

            res.status(200).json({ message: "Successfully", update_user });

        } catch (error) {
            console.log("error", error);
            res.status(200).json({ message: "Error Occurred faild", });
        }
    }

    /** 
     * This function is auth the zapier with octonius
     * @param req 
     * @param res 
     * @param next 
    */
    async subscribeTrigger(req: Request, res: Response, next: NextFunction) {

        const user = await User.findById(req['userId']);

        if (user) {

            const zapierTrigger = {
                trigger: req.body?.trigger,
                webhookURl: req.body?.hookUrl
            }
            // Update the user's integrationd
            const update_user = await User.findOneAndUpdate({ _id: user._id },
                { $push: { 'integrations.zapier.webhook': { $each: [zapierTrigger] } } },
                { new: true });

            res.status(200).json({ id: req.body?.hookUrl });
        } else {
            res.status(200).json({});
        }



    }

    /** 
    * This function is auth the zapier with octonius
    * @param req 
    * @param res 
    * @param next 
   */
    async unSubscribeTrigger(req: Request, res: Response, next: NextFunction) {
        // Find user with id
        const user = await User.findById(req['userId']);

        if (user) {

            const data = {
                $pull: {
                    'integrations.zapier.webhook': {
                        trigger: req.body?.trigger,
                        webhookURl: req.body?.hookUrl
                    }
                }
            };
            try {
                const update_user = await User.findOneAndUpdate({ _id: user._id }, data, { new: true, multi: true });
                res.status(200).json({});
            } catch (error) {
                console.log(error);
                res.status(200).json({});
            }

        } else {
            res.status(200).json({});
        }

    }

}
