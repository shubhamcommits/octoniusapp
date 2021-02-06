import { Flow } from '../models';
import { Response, Request, NextFunction } from 'express';
import { sendError } from '../../utils';

/*  ===================
 *  -- FLOW METHODS --
 *  ===================
 * */

export class FlowController {

    async addAutomationFlow(req: Request, res: Response, next: NextFunction) {
        try {
            const flowData = {
                name: 'New Flow',
                _group: req.body.groupId
            }
            const flow = await Flow.create(flowData);

            return res.status(200).json({
                message: 'New Automation Flow added successfully!',
                flow: flow,
              });
        } catch (error) {
            return sendError(res, error, 'Internal Server Error!', 500);
        }
    }
    
    async deleteFlow(req: Request, res: Response, next: NextFunction) {
        try {
            const flowId = req.params.flowId

            const flow = await Flow.findOneAndDelete({_id: flowId});

            return res.status(200).json({
                message: 'Automation Flow deleted successfully!',
                flow: flow
              });
        } catch (error) {
            return sendError(res, error, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function fetches the automation flows of the group corresponding to the @constant groupId 
     * @param req - @constant groupId
     */
    async getAutomationFlows(req: Request, res: Response) {
        try {
            // Find the Group based on the groupId
            const flows = await Flow.find({
                _group: req.params.groupId
            })
            .sort('name')
            .populate('steps.action._user', '_id profile_pic')
            .populate('steps.trigger._user', '_id profile_pic')
            .populate('steps.action._section', '_id title')
            .populate('steps.trigger._section', '_id title')
            .lean();

            // Check if group already exist with the same groupId
            if (!flows) {
                return sendError(res, new Error('Oops, flows not found!'), 'Flows not found, Invalid groupId!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: 'Flows found!',
                flows: flows
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function updates the flow name
     * @param req - @constant flowId
     * @param req - @constant flowName
     */
    async updateFlowName(req: Request, res: Response) {
        try {
            const { flowName, flowId } = req.body;

            // Find the Group based on the groupId
            const flow = await Flow.findOneAndUpdate({
                _id: flowId 
            }, {
                "name": flowName
            })
            .lean();

            // Check if group already exist with the same groupId
            if (!flow) {
                return sendError(res, new Error('Oops, flow not found!'), 'Flow not found, Invalid groupId or flowId!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: 'Flow Name updated!',
                flow: flow
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function fetches the flow corresponding to the @constant flowId 
     * @param req - @constant flowId
     */
    async getFlow(req: Request, res: Response) {
        try {

            const { flowId } = req.params;
            // Find the Flow based on the flowId
            const flow = await Flow.findOne({
                _id: flowId
            })
            .populate({
                path: 'steps.trigger._user',
                select: 'first_name last_name profile_pic created_date'
            })
            .populate({
                path: 'steps.action._user',
                select: 'first_name last_name profile_pic created_date'
            })
            .populate('steps.action._section', '_id title')
            .populate('steps.trigger._section', '_id title')
            .lean();

            if (!flow) {
                return sendError(res, new Error('Oops, flow not found!'), 'Flow not found, Invalid flowId!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: 'Flow found!',
                flow: flow
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    async removeFlowStep(req: Request, res: Response, next: NextFunction) {
        try {
            const { stepId, flowId } = req.body;

            const flow = await Flow.findByIdAndUpdate({
                _id: flowId
            }, {
                $pull: {
                    steps: {_id: stepId}
                }
            });

            return res.status(200).json({
                message: 'Flow Step removed successfully!',
                flow: flow,
              });
        } catch (error) {
            return sendError(res, error, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function updates the flow name
     * @param req - @constant stepId
     * @param req - @constant flowId
     */
    async saveStep(req: Request, res: Response) {
        try {
            const { flowId } = req.params;
            const { step } = req.body;
            let flow;

            if (step._id) {
                await Flow.findByIdAndUpdate({
                    _id: flowId
                }, {
                    $pull: {
                        steps: {_id: step._id}
                    }
                });
                delete step._id;
            }
            
            // Find the Group based on the groupId
            flow = await Flow.findOneAndUpdate({
                _id: flowId
            }, {
                $push: { "steps": step }
            }, {
                new: true
            })
            .populate({
                path: 'steps.trigger._user',
                select: 'first_name last_name profile_pic created_date'
            })
            .populate({
                path: 'steps.action._user',
                select: 'first_name last_name profile_pic created_date'
            })
            .populate('steps.action._section', '_id title')
            .populate('steps.trigger._section', '_id title')
            .lean();

            // Check if group already exist with the same groupId
            if (!flow) {
                return sendError(res, new Error('Oops, step not found!'), 'Step not found, Invalid stepId or flowId!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: 'Step updated!',
                flow: flow
            });
        } catch (err) {
            return sendError(res, err);
        }
    };
}
