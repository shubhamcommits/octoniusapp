import { sendError } from '../../utils';
import { Request, Response, NextFunction } from 'express';
import { Entity, Holiday, User, Notification } from '../models';
import { Readable } from 'stream';
import moment from 'moment';
import { DateTime } from 'luxon';

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

            const newVariable = {
                name: variable.name,
                type: variable.type,
                value: variable.value
            }

            const entity = await Entity.findByIdAndUpdate({
                    _id: entityId
                }, {
                    $addToSet: {
                        payroll_variables: newVariable
                    }
                }, {
                    new: true
                })
                .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
                .lean();
    
            // Send the status 200 response 
            return res.status(200).json({
                message: 'Payroll Variables created.',
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
                message: 'Payroll Variables edited.',
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
                message: 'Payroll Variables deleted.',
                entity: entity
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async getEntityInfo(req: Request, res: Response, next: NextFunction) {
        try {

            const userId = req['userId'];

            // Find the workspace based on the workspaceId
            const user: any = await User.findOne({
                _id: userId
            }).select('hr._entity').lean();

            // Check if workspace already exist with the same workspaceId
            if (!user || ! user.hr || ! user.hr._entity) {
                // return sendError(res, new Error('Oops, user not found or doesn´t have a payroll entity assigned!'), 'User not found or doesn´t have a payroll entity assigned!', 404);
                return res.status(200).json({
                    message: 'User is not assigned to an entity!'
                });
            }

            const entity: any = await Entity.findOne({
                    _id: user?.hr?._entity
                }).select('payroll_custom_fields payroll_variables payroll_benefits').lean();

            // Send the status 200 response
            return res.status(200).json({
                message: 'Entity found!',
                entity: entity
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

    async createEntityCF(req: Request, res: Response, next: NextFunction) {
        try {
            const { params: { entityId }, body: { cf } } = req;

            if (!entityId || !cf) {
                return sendError(res, new Error('Please provide the entityId property!'), 'Please provide the entityId property!', 500);
            }

            const newCF = {
                name: cf.name,
                type: cf.type,
                values: cf.values
            }

            const entity = await Entity.findByIdAndUpdate({
                    _id: entityId
                }, {
                    $addToSet: {
                        payroll_custom_fields: newCF
                    }
                }, {
                    new: true
                })
                .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
                .lean();

            // Send the status 200 response 
            return res.status(200).json({
                message: 'Custom Fields created.',
                entity: entity
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async editEntityCF(req: Request, res: Response, next: NextFunction) {
        try {
            const { params: { entityId }, body: { cf } } = req;

            if (!entityId || !cf) {
                return sendError(res, new Error('Please provide the entityId property!'), 'Please provide the entityId property!', 500);
            }

            const entity = await Entity.findByIdAndUpdate({
                    _id: entityId
                }, {
                    $set: {
                        'payroll_custom_fields.$[cf]': cf
                    }
                },
                {
                    arrayFilters: [{ "cf._id": cf?._id }],
                    new: true
                })
                .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
                .lean();

            // Send the status 200 response 
            return res.status(200).json({
                message: 'Custom Fields edited.',
                entity: entity
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async deleteEntityCF(req: Request, res: Response, next: NextFunction) {
        try {
            const { params: { entityId }, body: { cfId } } = req;

            if (!entityId || !cfId) {
                return sendError(res, new Error('Please provide the entityId property!'), 'Please provide the entityId property!', 500);
            }

            const entity = await Entity.findByIdAndUpdate({
                    _id: entityId
                }, {
                    $pull: { payroll_custom_fields: { _id: cfId }}
                },
                {
                    new: true
                })
                .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
                .lean();

            // Send the status 200 response 
            return res.status(200).json({
                message: 'Custom Fields delted.',
                entity: entity
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async createEntityBenefit(req: Request, res: Response, next: NextFunction) {
        try {
            const { params: { entityId }, body: { benefit } } = req;

            if (!entityId || !benefit) {
                return sendError(res, new Error('Please provide the entityId property!'), 'Please provide the entityId property!', 500);
            }

            const newBenefit = {
                name: benefit.name,
                type: benefit.type,
                values: benefit.values
            }

            const entity = await Entity.findByIdAndUpdate({
                    _id: entityId
                }, {
                    $addToSet: {
                        payroll_benefits: newBenefit
                    }
                }, {
                    new: true
                })
                .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
                .lean();

            // Send the status 200 response 
            return res.status(200).json({
                message: 'Benefit created.',
                entity: entity
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async editEntityBenefit(req: Request, res: Response, next: NextFunction) {
        try {
            const { params: { entityId }, body: { benefit } } = req;

            if (!entityId || !benefit) {
                return sendError(res, new Error('Please provide the entityId property!'), 'Please provide the entityId property!', 500);
            }

            const entity = await Entity.findByIdAndUpdate({
                    _id: entityId
                }, {
                    $set: {
                        'payroll_benefits.$[benefit]': benefit
                    }
                },
                {
                    arrayFilters: [{ "benefit._id": benefit?._id }],
                    new: true
                })
                .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
                .lean();

            // Send the status 200 response 
            return res.status(200).json({
                message: 'Benefit edited.',
                entity: entity
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async deleteEntityBenefit(req: Request, res: Response, next: NextFunction) {
        try {
            const { params: { entityId }, body: { benefitId } } = req;

            if (!entityId || !benefitId) {
                return sendError(res, new Error('Please provide the entityId property!'), 'Please provide the entityId property!', 500);
            }

            const entity = await Entity.findByIdAndUpdate({
                    _id: entityId
                }, {
                    $pull: { payroll_benefits: { _id: benefitId }}
                },
                {
                    new: true
                })
                .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
                .lean();

            // Send the status 200 response 
            return res.status(200).json({
                message: 'Benefit delted.',
                entity: entity
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async createEntityDaysOff(req: Request, res: Response, next: NextFunction) {
        try {
            const { params: { entityId }, body: { daysOff } } = req;

            if (!entityId || !daysOff) {
                return sendError(res, new Error('Please provide the entityId property!'), 'Please provide the entityId property!', 500);
            }

            let entity = await Entity.findById({
                    _id: entityId
                }).select('payroll_days_off').lean();
            const index = (entity.payroll_days_off) ? entity.payroll_days_off.findIndex(dayOff => dayOff.year == daysOff.year) : -1;

            if (index >= 0) {
                return sendError(res, new Error('The year added already exists!'), 'The year added already exists!', 500);
            }
            
            const newDaysOff = {
                year: daysOff.year,
                holidays: daysOff.holidays,
                sick: daysOff.sick,
                personal_days: daysOff.personal_days
            }

            entity = await Entity.findByIdAndUpdate({
                    _id: entityId
                }, {
                    $addToSet: {
                        payroll_days_off: newDaysOff
                    }
                }, {
                    new: true
                })
                .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
                .lean();

            // Send the status 200 response 
            return res.status(200).json({
                message: 'Days Off created.',
                entity: entity
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async editEntityDaysOff(req: Request, res: Response, next: NextFunction) {
        try {
            const { params: { entityId }, body: { daysOff } } = req;

            if (!entityId || !daysOff) {
                return sendError(res, new Error('Please provide the entityId property!'), 'Please provide the entityId property!', 500);
            }

            const entity = await Entity.findByIdAndUpdate({
                    _id: entityId
                }, {
                    $set: {
                        'payroll_days_off.$[daysOff]': daysOff
                    }
                },
                {
                    arrayFilters: [{ "daysOff._id": daysOff?._id }],
                    new: true
                })
                .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
                .lean();

            // Send the status 200 response 
            return res.status(200).json({
                message: 'Benefit edited.',
                entity: entity
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async deleteEntityDaysOff(req: Request, res: Response, next: NextFunction) {
        try {
            const { params: { entityId }, body: { daysOffId } } = req;

            if (!entityId || !daysOffId) {
                return sendError(res, new Error('Please provide the entityId property!'), 'Please provide the entityId property!', 500);
            }

            const entity = await Entity.findByIdAndUpdate({
                    _id: entityId
                }, {
                    $pull: { payroll_days_off: { _id: daysOffId }}
                },
                {
                    new: true
                })
                .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
                .lean();

            // Send the status 200 response 
            return res.status(200).json({
                message: 'Days Off delted.',
                entity: entity
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async addBankHoliday(req: Request, res: Response, next: NextFunction) {
        try {
            const { params: { entityId }, body: { daysOffId, bankHoliday } } = req;

            if (!entityId || !daysOffId || !bankHoliday) {
                return sendError(res, new Error('Please provide the entityId property!'), 'Please provide the entityId property!', 500);
            }

            const entity = await Entity.findByIdAndUpdate({
                    _id: entityId
                }, {
                    $addToSet: {
                        'payroll_days_off.$[daysOff].bank_holidays': bankHoliday
                    }
                },
                {
                    arrayFilters: [{ "daysOff._id": daysOffId }],
                    new: true
                })
                .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
                .lean();

            // Send the status 200 response 
            return res.status(200).json({
                message: 'Bank Holiday added.',
                entity: entity
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async removeBankHoliday(req: Request, res: Response, next: NextFunction) {
        try {
            const { params: { entityId }, body: { daysOffId, bankHoliday } } = req;

            if (!entityId || !daysOffId || !bankHoliday) {
                return sendError(res, new Error('Please provide the entityId property!'), 'Please provide the entityId property!', 500);
            }

            const entity = await Entity.findByIdAndUpdate({
                    _id: entityId
                }, {
                    $pull: {
                        'payroll_days_off.$[daysOff].bank_holidays': bankHoliday
                    }
                },
                {
                    arrayFilters: [{ "daysOff._id": daysOffId }],
                    new: true
                })
                .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
                .lean();

            // Send the status 200 response 
            return res.status(200).json({
                message: 'Bank Holiday delted.',
                entity: entity
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async getEntityMembers(req: Request, res: Response, next: NextFunction) {
        try {

            const { params: { entityId } } = req;

            // Find the workspace based on the workspaceId
            const users: any = await User.find({
                $and: [
                    { 'hr._entity': entityId },
                    { active: true }
                ]
                
            }).select('_id first_name last_name email profile_pic hr').lean();

            // Check if workspace already exist with the same workspaceId
            if (!users) {
                return sendError(res, new Error('Oops, users not found!'), 'Users not found!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: 'Users found!',
                members: users
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

    async removeMemberFromEntity(req: Request, res: Response, next: NextFunction) {
        try {
            const { params: { entityId }, body: { memberId } } = req;

            if (!entityId || !memberId) {
                return sendError(res, new Error('Please provide the entityId and memberId property!'), 'Please provide the entityId and memberId property!', 500);
            }

            const user = await User.findOne({
                $and: [
                    { _id: memberId },
                    { 'hr._entity' : entityId }
                ]
            }).select('_id').lean();

            if (!user) {
                return sendError(res, new Error('The user provided is not part of the entity provided!'), 'The user provided is not part of the entity provided', 500);
            }

            const member = await User.findByIdAndUpdate({
                    _id: memberId
                }, {
                    $set: { 'hr._entity': null }
                },
                {
                    new: true
                }).select('_id first_name last_name email profile_pic hr').lean();

            // Send the status 200 response 
            return res.status(200).json({
                message: 'Member removed.',
                member: member
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async addMemberToEntity(req: Request, res: Response, next: NextFunction) {
        try {
            const { params: { entityId }, body: { memberId } } = req;

            if (!entityId || !memberId) {
                return sendError(res, new Error('Please provide the entityId and memberId property!'), 'Please provide the entityId and memberId property!', 500);
            }

            const member = await User.findByIdAndUpdate({
                    _id: memberId
                }, {
                    $set: { 'hr._entity': entityId }
                },
                {
                    new: true
                }).select('_id first_name last_name email profile_pic hr').lean();

            // Send the status 200 response 
            return res.status(200).json({
                message: 'Member added.',
                member: member
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async addAllMemberToEntity(req: Request, res: Response, next: NextFunction) {
        try {
            const { params: { entityId }, body: { workspaceId }  } = req;

            if (!entityId || !workspaceId) {
                return sendError(res, new Error('Please provide the entityId and workspaceId property!'), 'Please provide the entityId and workspaceId property!', 500);
            }

            const userStream = Readable.from(await User.find({
                    $and: [
                        { _workspace: workspaceId },
                        { active: true }
                    ]
                }).select('_id'));

            await userStream.on('data', async (user: any) => {
                await User.findByIdAndUpdate({
                    _id: user?._id
                }, {
                    $set: { 'hr._entity': entityId }
                });
            });

            // Send the status 200 response 
            return res.status(200).json({
                message: 'Users Added.'
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async getTopMembersOff(req: Request, res: Response, next: NextFunction) {
        try {
            const { params: { workspaceId } } = req;

            const from = moment().startOf('week');
            const to = moment().endOf('week');

            const holidays = await Holiday.find({
                    $and: [
                        { status: 'approved' },
                        {
                            $or: [
                                {
                                    $and: [
                                        { start_date: { $gte: from }},
                                        { start_date: { $lte: to }},
                                        { end_date: { $gte: from }},
                                        { end_date: { $lte: to }}
                                    ]
                                }, {
                                    $and: [
                                        { start_date: { $lte: from }},
                                        { start_date: { $lte: to }},
                                        { end_date: { $gte: from }},
                                        { end_date: { $lte: to }}
                                    ]
                                }, {
                                    $and: [
                                        { start_date: { $lte: from }},
                                        { start_date: { $lte: to }},
                                        { end_date: { $gte: from }},
                                        { end_date: { $gte: to }}
                                    ]
                                }, {
                                    $and: [
                                        { start_date: { $gte: from }},
                                        { start_date: { $lte: to }},
                                        { end_date: { $gte: from }},
                                        { end_date: { $gte: to }}
                                    ]
                                }
                            ]
                        }
                    ]
                })
                .limit(6)
                .populate({
                    path: '_user',
                    select: '_id first_name last_name email profile_pic hr'
                })
                .lean() || [];

            if (!holidays) {
                return sendError(res, new Error('Oops, holidays not found!'), 'Holidays not found!', 404);
            }

            const users = holidays.map(holiday => {
                holiday._user.start_date = holiday.start_date;
                holiday._user.end_date = holiday.end_date;
                return holiday._user
            });

            // Send the status 200 response
            return res.status(200).json({
                message: 'Users found!',
                members: users
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

    async getMembersOff(req: Request, res: Response, next: NextFunction) {
        try {
            const { query: { members, from, to, approved }} = req;

            let holidays = [];
            if (!!approved) {
                holidays = await Holiday.find({
                        $and: [
                            { _user: { $in: members }},
                            {
                                $or: [
                                    {
                                        $and: [
                                            { start_date: { $gte: from }},
                                            { start_date: { $lte: to }},
                                            { end_date: { $gte: from }},
                                            { end_date: { $lte: to }}
                                        ]
                                    }, {
                                        $and: [
                                            { start_date: { $lte: from }},
                                            { start_date: { $lte: to }},
                                            { end_date: { $gte: from }},
                                            { end_date: { $lte: to }}
                                        ]
                                    }, {
                                        $and: [
                                            { start_date: { $lte: from }},
                                            { start_date: { $lte: to }},
                                            { end_date: { $gte: from }},
                                            { end_date: { $gte: to }}
                                        ]
                                    }, {
                                        $and: [
                                            { start_date: { $gte: from }},
                                            { start_date: { $lte: to }},
                                            { end_date: { $gte: from }},
                                            { end_date: { $gte: to }}
                                        ]
                                    }
                                ]
                            }
                        ]
                    })
                    .populate({
                        path: '_user',
                        select: '_id first_name last_name email profile_pic hr'
                    })
                    .lean() || [];
            } else {
                holidays = await Holiday.find({
                        $and: [
                            { _user: { $in: members }},
                            { status: 'approved' },
                            {
                                $or: [
                                    {
                                        $and: [
                                            { start_date: { $gte: from }},
                                            { start_date: { $lte: to }},
                                            { end_date: { $gte: from }},
                                            { end_date: { $lte: to }}
                                        ]
                                    }, {
                                        $and: [
                                            { start_date: { $lte: from }},
                                            { start_date: { $lte: to }},
                                            { end_date: { $gte: from }},
                                            { end_date: { $lte: to }}
                                        ]
                                    }, {
                                        $and: [
                                            { start_date: { $lte: from }},
                                            { start_date: { $lte: to }},
                                            { end_date: { $gte: from }},
                                            { end_date: { $gte: to }}
                                        ]
                                    }, {
                                        $and: [
                                            { start_date: { $gte: from }},
                                            { start_date: { $lte: to }},
                                            { end_date: { $gte: from }},
                                            { end_date: { $gte: to }}
                                        ]
                                    }
                                ]
                            }
                        ]
                    })
                    .populate({
                        path: '_user',
                        select: '_id first_name last_name email profile_pic hr'
                    })
                    .lean() || [];
            }

            const users = holidays.map(holiday => {
                holiday._user.start_date = holiday.start_date;
                holiday._user.end_date = holiday.end_date;
                return holiday._user
            });

            // Send the status 200 response
            return res.status(200).json({
                message: 'Holidays found!',
                holidays: holidays,
                members: users
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

    async getHRPendingNotifications(req: Request, res: Response, next: NextFunction) {
        try {
            const { params: { workspaceId }} = req;

            const notifications = await Notification.find({
                    $and: [
                        { _workspace: workspaceId },
                        // { type: 'hive' },
                        {
                            $or: [
                                { type: 'hive' },
                                { type: 'hive_new_entity' }
                            ]
                        },
                        { read: false }
                    ]
                })
                .sort('created_date')
                .populate({
                    path: '_owner',
                    select: '_id first_name last_name email profile_pic'
                })
                .lean() || [];

            // Send the status 200 response
            return res.status(200).json({
                message: 'Notifications found!',
                notifications: notifications
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

    async getTopHRPendingNotifications(req: Request, res: Response, next: NextFunction) {
        try {
            const { params: { workspaceId }} = req;

            const notifications = await Notification.find({
                    $and: [
                        { _workspace: workspaceId },
                        // { type: 'hive' },
                        {
                            $or: [
                                { type: 'hive' },
                                { type: 'hive_new_entity' }
                            ]
                        },
                        { read: false }
                    ]
                })
                .sort('created_date')
                .limit(6)
                .populate({
                    path: '_owner',
                    select: '_id first_name last_name email profile_pic'
                })
                .lean() || [];

            const totalNotificationsCount = await Notification.find({
                    $and: [
                        { _workspace: workspaceId },
                        // { type: 'hive' },
                        {
                            $or: [
                                { type: 'hive' },
                                { type: 'hive_new_entity' }
                            ]
                        },
                        { read: false }
                    ]
                }).countDocuments();

            // Send the status 200 response
            return res.status(200).json({
                message: 'Notifications found!',
                notifications: notifications,
                totalCount: totalNotificationsCount
            });
        } catch (err) {
            return sendError(res, err);
        }
    }

    async markNotificationAsDone(req: Request, res: Response, next: NextFunction) {
        try {
            const { params: { notificationId }} = req;

            if (!notificationId) {
                return sendError(res, new Error('Please provide the notificationId property!'), 'Please provide the notificationId property!', 500);
            }

            const notifications = await Notification.findByIdAndUpdate({
                    _id: notificationId
                }, {
                    $set: {
                        read: true,
                        read_date: DateTime.now()
                    }
                })
                .lean();

            // Send the status 200 response 
            return res.status(200).json({
                message: 'Notification DONE.'
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }
}
