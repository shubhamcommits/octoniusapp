import { sendError } from '../../utils';
import { Lounge, Story } from '../models';
import { Request, Response, NextFunction } from 'express';

export class StoriesController {

    /**
      * This function add's the domain to the allowed_domain set which allows those specific domains to signup to the workspace
      * @param { userId, body: { story } }req 
      * @param res 
      * @param next 
      */
    async addStory(req: Request, res: Response, next: NextFunction) {
        try {

            // Request Data
            const { body: { story } } = req;

            // If story is null or not provided then we throw BAD REQUEST 
            if (!story) {
                return res.status(400).json({
                    message: 'Please provide story as a parameter!'
                })
            }

            // If the story doesn´t have _lounge we add it to the global stories
            if (!story._lounge) {
                const lounge = await Lounge.find({
                        name: 'Global stories'
                    }).lean();

                if (lounge) {
                    story._lounge = lounge;
                }
            }

            // Add the lounge 
            let storyMongo = await Story.create(story);

            if (story._lounge) {
                await Lounge.findByIdAndUpdate({
                        _id: (story._lounge._id || story._lounge)
                    }, {
                        $addToSet: {
                            _stories: storyMongo?._id
                        }
                    });

                    storyMongo = await Story.findById({_id: storyMongo._id})
                        .populate({ path: '_lounge', select: 'name type icon_pic _parent _group _workspace _posted_by created_date _lounges _stories' })
                        .lean();
            }

            // Send the status 200 response
            return res.status(200).json({
                message: "New story was added!",
                story: storyMongo
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
    async getAllStories(req: Request, res: Response, next: NextFunction) {
        try {

            const { workspaceId, loungeId } = req.query;

            // If workspaceId is null or not provided then we throw BAD REQUEST 
            if (!workspaceId) {
                return res.status(400).json({
                    message: 'Please provide workspaceId as the query parameter!'
                });
            }

            let query  = (loungeId && loungeId != '')
                ? {
                    _workspace: workspaceId,
                    _lounge: loungeId
                }
                : {
                    _workspace: workspaceId
                }

            // Find the list of lounges
            const stories: any = await Story.find(query).lean();

            // Unable to find the domains
            if (!stories) {
                return sendError(res, new Error('Unable to fetch the data as the workspaceId is invalid!'), 'Unable to fetch the data as the workspaceId is invalid!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: `Found ${stories.length} stories!`,
                stories: stories || []
            })
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
      * This function edit the sotry of the workspace
      * @param { userId, body: { lounge } }req 
      * @param res 
      * @param next 
      */
    async editStory(req: Request, res: Response, next: NextFunction) {
        try {

            // Request Data
            const { body: { properties }, params: {storyId} } = req;

            // If storyId is null or not provided then we throw BAD REQUEST 
            if (!properties || !storyId) {
                return res.status(400).json({
                    message: 'Please provide story and the properties!'
                })
            }

            // Edit the story 
            const story = await Story.findByIdAndUpdate({
                    _id: storyId
                }, {
                    $set: properties
                }, {
                    new: true
                })
                .populate({ path: '_lounge', select: 'name type icon_pic _parent _group _workspace _posted_by created_date _lounges _stories' })
                .lean();

            // Send the status 200 response
            return res.status(200).json({
                message: "Story edited!",
                story: story
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for fetching the specific story
     * @param { params: { storyId } }req 
     * @param res 
     * @param next 
     */
    async getStory(req: Request, res: Response, next: NextFunction) {
        try {

            const { storyId } = req.params;

            // If storyId is null or not provided then we throw BAD REQUEST 
            if (!storyId) {
                return res.status(400).json({
                    message: 'Please provide storyId as the query parameter!'
                })
            }

            // Find the story
            const story: any = await Story.findById({ _id: storyId })
                .populate({ path: '_lounge', select: 'name type icon_pic _parent _group _workspace _posted_by created_date _lounges _stories' })
                .lean();

            // Unable to find the domains
            if (!story) {
                return sendError(res, new Error('Unable to fetch the data as the storyId is invalid!'), 'Unable to fetch the data as the storyId is invalid!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: `Found story!`,
                story: story
            })
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for removing the story
     * @param { userId, { params: { loungeId, domain } } }req 
     * @param res 
     * @param next 
     */
    async remove(req: Request, res: Response, next: NextFunction) {
        try {

            const { params: { storyId } } = req;

            // If loungeId is null or not provided then we throw BAD REQUEST 
            if (!storyId) {
                return res.status(400).json({
                    message: 'Please provide a loungeId as the query parameter!'
                })
            }

            const story = await Story.findOneAndDelete({ _id: storyId }).lean();
            if (story._lounge) {
                await Lounge.findByIdAndUpdate({
                        _id: story._lounge
                    }, {
                        $pull: {
                            _stories: storyId
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
}
