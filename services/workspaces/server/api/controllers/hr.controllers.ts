import { sendError } from '../../utils';
import { Request, Response, NextFunction } from 'express';
import { Entity } from '../models';
import moment from 'moment';

export class HRControllers {

    /**
     * This function is responsible for fetching the information of the workspace for the mgmt portal
     * @param { params: { workspaceId } }req 
     * @param res 
     * @param next 
     */
     async createEntity(req: Request, res: Response, next: NextFunction) {
        try {
            const { body: { workspaceId, entityName } } = req;

            if (!workspaceId || !entityName) {
                return sendError(res, new Error('Please provide the workspaceId and entityName properties!'), 'Please provide the workspaceId and entityName properties!', 500);
            }

            const entity = await Entity.create({
                    name: entityName,
                    _workspace: workspaceId,
                    _posted_by: req['userId'],
                    created_date: moment().format()
                });

            // Send the status 200 response 
            return res.status(200).json({
                message: 'Entity created.',
                entity: entity
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for updating the workspace name remotely from the mgmt portal
     * @param { params: { workspaceId } }req 
     * @param res 
     * @param next 
     */
    async getEntities(req: Request, res: Response, next: NextFunction) {
        try {
            const { query: { workspaceId } } = req;

            if (!workspaceId) {
                return sendError(res, new Error('Please provide the workspaceId property!'), 'Please provide the workspaceId property!', 500);
            }

            const entities = await Entity.find({
                    _workspace: workspaceId
                }).lean();
    
            // Send the status 200 response 
            return res.status(200).json({
                message: 'Entities found.',
                entities: entities
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for updating the workspace name remotely from the mgmt portal
     * @param { params: { entityId } }req 
     * @param res 
     * @param next 
     */
    async getEntity(req: Request, res: Response, next: NextFunction) {
        try {
            const { params: { entityId } } = req;

            if (!entityId) {
                return sendError(res, new Error('Please provide the workspaceId property!'), 'Please provide the workspaceId property!', 500);
            }

            const entity = await Entity.findById({
                    _id: entityId
                })
                .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
                .lean();
    
            // Send the status 200 response 
            return res.status(200).json({
                message: 'Entity found.',
                entity: entity
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async editEntityProperty(req: Request, res: Response, next: NextFunction) {
        try {
            const { params: { entityId }, body: { propertyToSave } } = req;

            if (!entityId || !propertyToSave) {
                return sendError(res, new Error('Please provide the entityId property!'), 'Please provide the entityId property!', 500);
            }

            const entity = await Entity.findByIdAndUpdate({
                    _id: entityId
                }, {
                    $set: propertyToSave
                })
                .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
                .lean();
    
            // Send the status 200 response 
            return res.status(200).json({
                message: 'Entity found.',
                entity: entity
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for deleting the entity
     * @param { params: { entityId } }req 
     * @param res 
     * @param next 
     */
    async removeEntity(req: Request, res: Response, next: NextFunction) {
        try {
            const { params: { entityId } } = req;

            if (!entityId) {
                return sendError(res, new Error('Please provide the entityId property!'), 'Please provide the entityId property!', 500);
            }

            await Entity.deleteOne({_id: entityId});

            // Send the status 200 response 
            return res.status(200).json({
                message: 'Entity Deleted.'
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async createEntityVariable(req: Request, res: Response, next: NextFunction) {
        try {
            const { params: { entityId }, body: { variable } } = req;

            if (!entityId || !variable) {
                return sendError(res, new Error('Please provide the entityId property!'), 'Please provide the entityId property!', 500);
            }

            const entity = await Entity.findByIdAndUpdate({
                    _id: entityId
                }, {
                    $addToSet: {
                        payroll_variables: variable
                    }
                })
                .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
                .lean();
    
            // Send the status 200 response 
            return res.status(200).json({
                message: 'Entity found.',
                entity: entity
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async editEntityVariable(req: Request, res: Response, next: NextFunction) {
        try {
            const { params: { entityId }, body: { variable } } = req;

            if (!entityId || !variable) {
                return sendError(res, new Error('Please provide the entityId property!'), 'Please provide the entityId property!', 500);
            }

            const entity = await Entity.findByIdAndUpdate({
                    _id: entityId
                }, {
                    $set: {
                        'payroll_variables.$[variable]': variable
                    }
                },
                {
                    arrayFilters: [{ "variable._id": variable?._id }],
                    new: true
                })
                .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
                .lean();

            // Send the status 200 response 
            return res.status(200).json({
                message: 'Entity found.',
                entity: entity
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async deleteEntityVariable(req: Request, res: Response, next: NextFunction) {
        try {
            const { params: { entityId }, body: { variableId } } = req;

            if (!entityId || !variableId) {
                return sendError(res, new Error('Please provide the entityId property!'), 'Please provide the entityId property!', 500);
            }

            const entity = await Entity.findByIdAndUpdate({
                    _id: entityId
                }, {
                    $pull: { payroll_variables: { _id: variableId }}
                },
                {
                    new: true
                })
                .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
                .lean();

            // Send the status 200 response 
            return res.status(200).json({
                message: 'Entity found.',
                entity: entity
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }
}
