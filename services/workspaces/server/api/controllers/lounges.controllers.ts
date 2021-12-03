import { sendError } from '../../utils';
import { Lounge, Story } from '../models';
import { Request, Response, NextFunction } from 'express';

export class LoungeController {

    /**
      * This function add's the lounge to the workspace
      * @param { userId, body: { lounge } }req 
      * @param res 
      * @param next 
      */
    async addLounge(req: Request, res: Response, next: NextFunction) {
        try {

            // Request Data
            const { body: { lounge } } = req;

            // If lounge is null or not provided then we throw BAD REQUEST 
            if (!lounge) {
                return res.status(400).json({
                    message: 'Please provide lounge as a parameter!'
                })
            }

            // Add the lounge 
            let loungeMongo = await Lounge.create(lounge);

            if (lounge._parent) {
                await Lounge.findByIdAndUpdate({
                        _id: lounge._parent
                    }, {
                        $addToSet: {
                            _lounges: loungeMongo._id
                        }
                    });

                loungeMongo = await Lounge.findById({_id: loungeMongo._id})
                    .populate({ path: '_lounges', select: 'name type icon_pic _parent _group _workspace _posted_by created_date _lounges _stories' })
                    .populate({ path: '_stories', select: 'name type icon_pic _lounge _group _workspace _posted_by created_date' })
                    .lean();
            }

            // Send the status 200 response
            return res.status(200).json({
                message: "New lounge was added!",
                lounge: loungeMongo
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
      * This function add's the domain to the allowed_domain set which allows those specific domains to signup to the workspace
      * @param { userId, body: { lounge } }req 
      * @param res 
      * @param next 
      */
    async editLounge(req: Request, res: Response, next: NextFunction) {
        try {

            // Request Data
            const { body: { properties }, params: {loungeId} } = req;

            // If lounge or domain is null or not provided then we throw BAD REQUEST 
            if (!properties || !loungeId) {
                return res.status(400).json({
                    message: 'Please provide lounge as a parameter!'
                })
            }

            let lounge = await Lounge.findById({_id: loungeId}).lean();

            // If the lounge is changing _parent we need to remove it from the array of lounges
            // and add it to the array of the new _parent
            if (properties._parent && lounge._parent
                    && (properties._parent._id || properties._parent) != (lounge._parent._if || lounge._parent)) {
                
                await Lounge.findByIdAndUpdate({
                        _id: (lounge._parent._id || lounge._parent)
                    }, {
                        $pull: {
                            _lounges: lounge._id
                        }
                    });
                await Lounge.findByIdAndUpdate({
                        _id: (properties._parent._id || properties._parent)
                    }, {
                        $addToSet: {
                            _lounges: lounge._id
                        }
                    });
            } else if (properties._parent && !lounge._parent) {
                // If the lounge didn´t have a parrent until now we add the lounge to the array of the new parent
                await Lounge.findByIdAndUpdate({
                        _id: (properties._parent._id || properties._parent)
                    }, {
                        $addToSet: {
                            _lounges: lounge._id
                        }
                    });
            }

            // Edit the lounge 
            lounge = await Lounge.findByIdAndUpdate({
                    _id: loungeId
                }, {
                    $set: properties
                }, {
                    new: true
                })
                .populate({ path: '_lounges', select: 'name type icon_pic _parent _group _workspace _posted_by created_date _lounges _stories' })
                .populate({ path: '_stories', select: 'name type icon_pic _lounge _group _workspace _posted_by created_date' })
                .lean();

            // Send the status 200 response
            return res.status(200).json({
                message: "Lounge edited!",
                lounge: lounge
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for fetching the list of allowed domains from which users can sign-up
     * @param { params: { workspaceId } }req 
     * @param res 
     * @param next 
     */
    async getLounge(req: Request, res: Response, next: NextFunction) {
        try {

            const { loungeId } = req.params;

            // If loungeId is null or not provided then we throw BAD REQUEST 
            if (!loungeId) {
                return res.status(400).json({
                    message: 'Please provide loungeId as the query parameter!'
                })
            }

            // Find the list of lounges
            const lounge: any = await Lounge.findById({ _id: loungeId })
                .populate({ path: '_lounges', select: 'name type icon_pic _parent _group _workspace _posted_by created_date _lounges _stories' })
                .populate({ path: '_stories', select: 'name type icon_pic _lounge _group _workspace _posted_by created_date' })
                .lean();

            // Unable to find the domains
            if (!lounge) {
                return sendError(res, new Error('Unable to fetch the data as the loungeId is invalid!'), 'Unable to fetch the data as the loungeId is invalid!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: `Found lounge!`,
                lounge: lounge
            })
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for fetching the list of allowed domains from which users can sign-up
     * @param { params: { workspaceId } }req 
     * @param res 
     * @param next 
     */
    async getAllLounges(req: Request, res: Response, next: NextFunction) {
        try {

            const { workspaceId, categoryId } = req.query;

            // If workspaceId is null or not provided then we throw BAD REQUEST 
            if (!workspaceId) {
                return res.status(400).json({
                    message: 'Please provide workspaceId as the query parameter!'
                })
            }

            let query  = (categoryId && categoryId != '')
                ? {
                    _workspace: workspaceId,
                    _parent: categoryId,
                    type: 'lounge'
                }
                : {
                    _workspace: workspaceId,
                    type: 'lounge'
                }

            // Find the list of lounges
            const lounges: any = await Lounge.find(query)
                .populate({ path: '_lounges', select: 'name type icon_pic _parent _group _workspace _posted_by created_date _lounges _stories' })
                .populate({ path: '_stories', select: 'name type icon_pic _lounge _group _workspace _posted_by created_date' })
                .lean();

            // Unable to find the domains
            if (!lounges) {
                return sendError(res, new Error('Unable to fetch the data as the workspaceId is invalid!'), 'Unable to fetch the data as the workspaceId is invalid!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: `Found ${lounges.length} lounge!`,
                lounges: lounges || []
            })
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for fetching the list of allowed domains from which users can sign-up
     * @param { params: { workspaceId } }req 
     * @param res 
     * @param next 
     */
    async getAllCategories(req: Request, res: Response, next: NextFunction) {
        try {

            const { workspaceId } = req.query;

            // If workspaceId is null or not provided then we throw BAD REQUEST 
            if (!workspaceId) {
                return res.status(400).json({
                    message: 'Please provide workspaceId as the query parameter!'
                })
            }

            // Find the list of categories
            let categories: any = await Lounge.find({
                    _workspace: workspaceId,
                    type: 'category'
                })
                .populate({ path: '_lounges', select: 'name type icon_pic _parent _group _workspace _posted_by created_date _lounges _stories' })
                .populate({ path: '_stories', select: 'name type icon_pic _lounge _group _workspace _posted_by created_date' })
                .lean();
            

            // Unable to find the domains
            if (!categories) {
                return sendError(res, new Error('Unable to fetch the data as the workspaceId is invalid!'), 'Unable to fetch the data as the workspaceId is invalid!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: `Found ${categories.length} lounge!`,
                lounges: categories || []
            })
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for removing the domain from the allowed_domains list and disabling the users who are signed up with those domain's email
     * @param { userId, { params: { loungeId, domain } } }req 
     * @param res 
     * @param next 
     */
    async removeLounge(req: Request, res: Response, next: NextFunction) {
        try {

            const { params: { loungeId } } = req;

            // If loungeId is null or not provided then we throw BAD REQUEST 
            if (!loungeId) {
                return res.status(400).json({
                    message: 'Please provide a loungeId as the query parameter!'
                })
            }

            await Story.deleteMany({ _lounge: loungeId });
            await Lounge.deleteMany({ _parent: loungeId });
            const lounge = await Lounge.findOneAndDelete({ _id: loungeId }).lean();
            if (lounge._parent) {
                await Lounge.findByIdAndUpdate({
                        _id: (lounge._parent._id || lounge._parent)
                    }, {
                        $pull: {
                            _lounges: loungeId
                        }
                    });
            }

            // Send the status 200 response
            return res.status(200).json({
                message: `Lounge removed from workspace`});
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * Updates the image property of an element defined by the ID,
     * the type, and the property name passed by parameters
     * @param req 
     * @param res 
     * @param next 
     */
    async editImage(req: Request, res: Response, next: NextFunction) {
        const { params: { elementId }, body } = req;

        try {
            let element: any;
            if (body.type == 'event' || body.type == 'story') {
                element = await Story.findOneAndUpdate({
                        _id: elementId
                    }, {
                        $set: body
                    }, {
                        new: true
                    })
                    .populate({ path: '_lounge', select: 'name type icon_pic _parent _group _workspace _posted_by created_date _lounges _stories' })
                    .populate({ path: '_posted_by', select: 'first_name last_name profile_pic role' })
                    .populate({ path: '_assistants', select: 'first_name last_name profile_pic role' })
                    .populate({ path: '_rejected_assistants', select: 'first_name last_name profile_pic role' })
                    .populate({ path: '_maybe_assistants', select: 'first_name last_name profile_pic role' })
                    .lean();
            } else if (body.type == 'lounge' || body.type == 'category') {
                element = await Lounge.findOneAndUpdate({
                        _id: elementId
                    }, {
                        $set: body
                    }, {
                        new: true
                    })
                    .populate({ path: '_lounges', select: 'name type icon_pic _parent _group _workspace _posted_by created_date _lounges _stories' })
                    .populate({ path: '_stories', select: 'name type icon_pic _lounge _group _workspace _posted_by created_date' })
                    .lean();
            }

            // Send the status 200 response
            return res.status(200).json({
                message: `Image updated!`,
                element: element
            })

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }
}
