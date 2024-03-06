import { Group, Resource } from '../models';
import { Response, Request, NextFunction } from 'express';
import { sendError, axios } from '../../utils';
import { ResourceService } from '../services';
import moment from 'moment';
import mongoose from 'mongoose';
import { resourcesRoutes } from '../routes';

const resourceService = new ResourceService();

/*  ===================
 *  -- Resources METHODS --
 *  ===================
 * */
export class ResourcesController {

    /**
     * This function creates the new resource in the group
     */
    async create(req: Request, res: Response) {
        const { body: { newResource } } = req;

        try {
            newResource._created_by = req['userId'];

            let resource = await Resource.create(newResource);

            return res.status(200).json({
                message: 'Resource created!',
                resource: resource
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async updateProperty(req: Request, res: Response, next: NextFunction) {

        let { body: { propertyData }, params: { resourceId } } = req;

        try {
            // Find the resource and update
            let resource = await Resource.findByIdAndUpdate({
                    _id: resourceId
                }, {
                    $set: propertyData
                });

            resource = await Resource.findByIdAndUpdate({
                    _id: resourceId
                }, {
                    $set: {
                        "last_updated_date": moment().format()
                    }
                }, {
                    new: true
                })
                .populate({
                    path: '_group',
                    select: 'group_name group_avatar workspace_name _members _admins',
                    match: {
                        active: true
                    }
                })
                .populate({
                    path: '_created_by',
                    select: 'first_name last_name profile_pic role email',
                    match: {
                        active: true
                    }
                })
                .populate({
                    path: 'activity._project',
                    select: 'title'
                })
                .populate({
                    path: 'activity._user',
                    select: 'first_name last_name profile_pic role email',
                    match: {
                        active: true
                    }
                })
                .lean();

            // Send status 200 response
            return res.status(200).json({
                message: 'Resource updated!',
                resource: resource
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    /**
     * This function is responsible for getting a resource details
     * @param { groupId } req 
     * @param res 
     */
    async getResourceDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const { resourceId } = req.params;

            // Find the Group based on the groupId
            const resource = await Resource.findOne({
                    _id: resourceId
                })
                .populate({
                    path: '_group',
                    select: 'group_name group_avatar workspace_name _members _admins',
                    match: {
                        active: true
                    }
                })
                .populate({
                    path: '_created_by',
                    select: 'first_name last_name profile_pic role email',
                    match: {
                        active: true
                    }
                })
                .populate({
                    path: 'activity._project',
                    select: 'title'
                })
                .populate({
                    path: 'activity._user',
                    select: 'first_name last_name profile_pic role email',
                    match: {
                        active: true
                    }
                })
                .lean();

            // Check if group already exist with the same groupId
            if (!resource) {
                return sendError(res, new Error('Oops, resource not found!'), 'Resource not found, Invalid groupId!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: 'Resources found!',
                resource
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function is responsible for getting a resource details
     * @param { groupId } req 
     * @param res 
     */
    async deleteResource(req: Request, res: Response, next: NextFunction) {
        try {
            const { resourceId } = req.params;

            // Find the Group based on the groupId
            await Resource.findByIdAndDelete({ _id: resourceId }).lean();

            // Send the status 200 response
            return res.status(200).json({
                message: 'Resources deleted!'
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function is responsible for getting all the resources in a group
     * @param { groupId } req 
     * @param res 
     */
    async getResources(req: Request, res: Response, next: NextFunction) {
        try {
            const { groupId } = req.params;

            // Find the Group based on the groupId
            const resources = await Resource.find({
                    _group: groupId
                })
                .populate({
                    path: '_group',
                    select: 'group_name group_avatar workspace_name _members _admins',
                    match: {
                        active: true
                    }
                })
                .populate({
                    path: '_created_by',
                    select: 'first_name last_name profile_pic role email',
                    match: {
                        active: true
                    }
                })
                .populate({
                    path: 'activity._project',
                    select: 'title'
                })
                .populate({
                    path: 'activity._user',
                    select: 'first_name last_name profile_pic role email',
                    match: {
                        active: true
                    }
                })
                .lean();

            // Check if group already exist with the same groupId
            if (!resources) {
                return sendError(res, new Error('Oops, resources not found!'), 'Resources not found, Invalid groupId!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: 'Resources found!',
                resources
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function is responsible for adding a new custom field for the particular group
     * @param { customFiel } req 
     * @param res 
     */
    async addResourceCustomField(req: Request, res: Response, next: NextFunction) {

        // Fetch the groupId
        const { groupId } = req.params;

        // Fetch the newCustomField from fileHandler middleware
        const newCustomField = req.body['newCustomField'];

        try {
            // Find the group and update their respective group avatar
            const group = await Group.findByIdAndUpdate({
                _id: groupId
            }, {
                //custom_fields: newCustomField
                $push: { "resources_custom_fields": newCustomField }
            }, {
                new: true
            }).select('resources_custom_fields');

            // Send status 200 response
            return res.status(200).json({
                message: 'Group custom fields updated!',
                group: group
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    /**
     * This function fetches the custom fields of the group corresponding to the @constant groupId 
     * @param req - @constant groupId
     */
    async getResourceCustomFields(req: Request, res: Response) {
        try {
            const { groupId } = req.params;

            // Find the Group based on the groupId
            const group = await Group.findOne({
                _id: groupId
            })
                .populate({
                    path: '_members',
                    select: 'resources_custom_fields',
                    match: {
                        active: true
                    }
                })
                .populate({
                    path: '_admins',
                    select: 'resources_custom_fields',
                    match: {
                        active: true
                    }
                })
                .populate({ path: 'rags._members', select: 'first_name last_name profile_pic role hr_role email' })
                .lean();

            // Check if group already exist with the same groupId
            if (!group) {
                return sendError(res, new Error('Oops, group not found!'), 'Group not found, Invalid groupId!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: 'Group found!',
                group
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    async removeResourceCustomField(req: Request, res: Response, next: NextFunction) {
        // Fetch the groupId & fieldId
        const { groupId, fieldId } = req.params;

        try {

            let group = await Group.findById({
                _id: groupId
            }).select('resources_custom_fields').lean();

            const cfIndex = group.resources_custom_fields.findIndex(cf => cf._id == fieldId);
            const cf = (group && group.resources_custom_fields) ? group.resources_custom_fields[cfIndex] : null;

            if (cf) {
                // remove the CF from the table widget
                group = await Group.findByIdAndUpdate({
                        _id: groupId
                    },
                    {
                        $pull: {
                            'resources_custom_fields_table_widget.selectTypeCFs': cf.name,
                            'resources_custom_fields_table_widget.inputTypeCFs': cf.name,
                            'resources_custom_fields_to_show': cf.name,
                        }
                    }).lean();

                /* TODO
                // remove the CF from the Posts where it is used
                await Resource.updateMany({
                        _group: groupId
                    }, {
                        $unset: { cf.name: 1 }
                    });
                */
            }

            // Find the group and update their respective group avatar
            group = await Group.findByIdAndUpdate({
                    _id: groupId
                }, {
                    $pull: {
                        resources_custom_fields: {
                            _id: fieldId
                        }
                    }
                }).lean();

            // Send status 200 response
            return res.status(200).json({
                message: 'Group custom fields updated!',
                group: group
            });
        } catch (err) {
            console.log(err);
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async addResourceCustomFieldValue(req: Request, res: Response, next: NextFunction) {

        // Fetch the groupId
        const { groupId } = req.params;

        // Fetch the field and value from fileHandler middleware
        const fieldId = req.body['fieldId'];
        const value = req.body['value'];

        try {
            // Find the custom field in a group and add the value
            const group = await Group.findByIdAndUpdate({
                _id: groupId
            }, {
                $push: { "resources_custom_fields.$[field].values": value }
            }, {
                arrayFilters: [{ "field._id": fieldId }],
                new: true
            }).select('resources_custom_fields');

            // Send status 200 response
            return res.status(200).json({
                message: 'Group custom fields updated!',
                group: group
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    // async setResourceCustomFieldDisplayKanbanCard(req: Request, res: Response, next: NextFunction) {

    //     // Fetch the groupId
    //     const { groupId } = req.params;

    //     // Fetch the field and value from fileHandler middleware
    //     const fieldId = req.body['fieldId'];
    //     const display_in_kanban_card = req.body['display_in_kanban_card'];

    //     try {
    //         // Find the custom field in a group and add the value
    //         const group = await Group.findByIdAndUpdate({
    //             _id: groupId
    //         }, {
    //             $set: { "resources_custom_fields.$[field].display_in_kanban_card": display_in_kanban_card }
    //         }, {
    //             arrayFilters: [{ "field._id": fieldId }],
    //             new: true
    //         }).select('resources_custom_fields')
    //             .lean();

    //         // Send status 200 response
    //         return res.status(200).json({
    //             message: 'Group custom fields updated!',
    //             group: group
    //         });
    //     } catch (err) {
    //         return sendError(res, err, 'Internal Server Error!', 500);
    //     }
    // };

    async setResourceCustomFieldColor(req: Request, res: Response, next: NextFunction) {

        // Fetch the groupId
        const { groupId } = req.params;

        // Fetch the field and value from fileHandler middleware
        const fieldId = req.body['fieldId'];
        const color = req.body['color'];

        try {
            // Find the custom field in a group and add the value
            const group = await Group.findByIdAndUpdate({
                    _id: groupId
                }, {
                    $set: { "resources_custom_fields.$[field].badge_color": color }
                }, {
                    arrayFilters: [{ "field._id": fieldId }],
                    new: true
                }).select('resources_custom_fields')
                .lean();

            // Send status 200 response
            return res.status(200).json({
                message: 'Group custom fields updated!',
                group: group
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    async removeResourceCustomFieldValue(req: Request, res: Response, next: NextFunction) {

        // Fetch the groupId
        const { groupId } = req.params;

        // Find the custom field in a group and remove the value
        const fieldId = req.body['fieldId'];
        const value = req.body['value'];

        try {
            // Find the group and update their respective group avatar
            const group = await Group.findByIdAndUpdate({
                _id: groupId
            }, {
                $pull: { "resources_custom_fields.$[field].values": value }
            }, {
                arrayFilters: [{ "field._id": fieldId }],
                new: true
            }).select('resources_custom_fields');

            // Send status 200 response
            return res.status(200).json({
                message: 'Group custom fields updated!',
                group: group
            });
        } catch (err) {
            console.log(err);
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    /**
     * This function is responsible for updating the custom fields to show in the list view for the particular group
     * @param res 
     */
    async updateCustomFieldsToShow(req: Request, res: Response, next: NextFunction) {

        // Fetch the fileName from fileHandler middleware
        const { body: { customFieldsToShow }, params: { groupId } } = req;

        try {
            // Find the group and update their respective group avatar
            const group = await Group.findOneAndUpdate({
                _id: groupId
            }, {
                "$set": {
                    "resources_custom_fields_to_show": customFieldsToShow
                }
            }, {
                new: true
            }).select('resources_custom_fields_to_show').lean();

            // Send status 200 response
            return res.status(200).json({
                message: 'Group custom fields to show updated!',
                group
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    async saveCustomField(req: Request, res: Response, next: NextFunction) {

        const { body: { customFieldValue, customFieldName }, params: { resourceId } } = req;

        try {
            let resource = await Resource.findById(resourceId);

            if (!resource['custom_fields']) {
                resource['custom_fields'] = new Map<string, string>();
            }
            resource['custom_fields'].set(customFieldName, customFieldValue);

            // Find the post and update the custom field
            resource = await Resource.findByIdAndUpdate({
                    _id: resourceId
                }, {
                    $set: {
                        "custom_fields": resource['custom_fields'],
                        "last_updated_date": moment().format()
                    }
                }, {
                    new: true
                })
                .populate({
                    path: '_group',
                    select: 'group_name group_avatar workspace_name _members _admins',
                    match: {
                        active: true
                    }
                })
                .populate({
                    path: '_created_by',
                    select: 'first_name last_name profile_pic role email',
                    match: {
                        active: true
                    }
                })
                .populate({
                    path: 'activity._project',
                    select: 'title'
                })
                .populate({
                    path: 'activity._user',
                    select: 'first_name last_name profile_pic role email',
                    match: {
                        active: true
                    }
                })
                .lean();

            // Send status 200 response
            return res.status(200).json({
                message: 'Custom Field updated!',
                resource: resource
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for adding a new custom field for the particular group
     * @param { customFiel } req 
     * @param res 
     */
    async addActivityEntity(req: Request, res: Response, next: NextFunction) {

        const { body: { newActivity }, params: { resourceId } } = req;
        
        try {
            const project = newActivity._project || null;
            const activityId = new mongoose.Types.ObjectId();
            let resource = await Resource.findByIdAndUpdate({
                    _id: resourceId
                }, {
                    $push: {
                        "activity": {
                            _id: activityId,
                            quantity: newActivity.quantity,
                            add_inventory: newActivity.add_inventory,
                            _project: project,
                            date: newActivity.date,
                            _user: newActivity._user,
                            file: newActivity.file,
                            comment: newActivity.comment,
                            edited_date: moment().format()
                        }
                    }
                }, {
                    new: true
                }).select('stock').lean();

            resource = await Resource.findByIdAndUpdate({
                    _id: resourceId
                }, {
                    $set: {
                        "stock": (newActivity.add_inventory)
                            ? resource.stock + newActivity.quantity
                            : resource.stock - newActivity.quantity,
                        "last_updated_date": moment().format()
                    }
                }, {
                    new: true
                })
                .populate({
                    path: '_group',
                    select: 'group_name group_avatar workspace_name _members _admins',
                    match: {
                        active: true
                    }
                })
                .populate({
                    path: '_created_by',
                    select: 'first_name last_name profile_pic role email',
                    match: {
                        active: true
                    }
                })
                .populate({
                    path: 'activity._project',
                    select: 'title'
                })
                .populate({
                    path: 'activity._user',
                    select: 'first_name last_name profile_pic role email',
                    match: {
                        active: true
                    }
                })
                .lean();
            
            const projectId = project?._id || project;
            if (!!projectId && !newActivity.add_inventory) {
                resourceService.addExpenseToProject(newActivity, resource, projectId);
            }

            // Send status 200 response
            return res.status(200).json({
                message: 'Resource Activity added!',
                resource: resource
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    /**
     * This function is responsible for adding a new time tracking entity
     * @param { timeTrackingEntity } req 
     * @param res 
     */
    async editActivityEntity(req: Request, res: Response, next: NextFunction) {

        // Fetch the editTimeTrackingEntityId
        const { resourceId, activityEntityId } = req.params;

        // Fetch the newTimeTrackEntity from fileHandler middleware
        let editedEntity = req.body['editedEntity'];
        let propertyEdited = req.body['propertyEdited'];
        
        try {
            let resource: any = {};
            switch (propertyEdited) {
                case 'user':
                    resource = await Resource.findByIdAndUpdate({
                            _id: resourceId
                        }, {
                            $set: {
                                'activity.$[act]._user': editedEntity?._user,
                                'activity.$[act].edited_date': moment().format(),
                                "last_updated_date": moment().format()
                            }
                        },
                        {
                            arrayFilters: [{ "act._id": activityEntityId }],
                            new: true
                        }).populate({
                                path: '_group',
                                select: 'group_name group_avatar workspace_name _members _admins',
                                match: {
                                    active: true
                                }
                            })
                            .populate({
                                path: '_created_by',
                                select: 'first_name last_name profile_pic role email',
                                match: {
                                    active: true
                                }
                            })
                            .populate({
                                path: 'activity._project',
                                select: 'title'
                            })
                            .populate({
                                path: 'activity._user',
                                select: 'first_name last_name profile_pic role email',
                                match: {
                                    active: true
                                }
                            })
                            .lean();
                    
                    const indexUser = (!!resource.activity) ? resource.activity.findIndex(a => a._id == activityEntityId) : -1;
                    if (indexUser >= 0) {
                        const activityTmp = resource.activity[indexUser];
                        if (!activityTmp.add_inventory) {
                            resourceService.editExpenseUser(editedEntity?._user?._id || editedEntity?._user, activityTmp._project._id || activityTmp._project, resourceId, activityTmp._id)
                        }
                    }
                    break;
                case 'project':
                    resource = await Resource.findById({ _id: resourceId }).select('stock activity').lean();
                    let indexProject = (!!resource.activity) ? resource.activity.findIndex(a => a._id == activityEntityId) : -1;
                    if (indexProject >= 0) {
                        let activity = resource.activity[indexProject];

                        resource = await Resource.findByIdAndUpdate({
                                _id: resourceId
                            }, {
                                $set: {
                                    'activity.$[act].add_inventory': false,
                                    'activity.$[act]._project': editedEntity?._project,
                                    'activity.$[act].edited_date': moment().format(),
                                    "last_updated_date": moment().format()
                                }
                            },
                            {
                                arrayFilters: [{ "act._id": activityEntityId }],
                                new: true
                            })
                            .populate({
                                path: '_group',
                                select: 'group_name group_avatar workspace_name _members _admins',
                                match: {
                                    active: true
                                }
                            })
                            .populate({
                                path: '_created_by',
                                select: 'first_name last_name profile_pic role email',
                                match: {
                                    active: true
                                }
                            })
                            .populate({
                                path: 'activity._project',
                                select: 'title'
                            })
                            .populate({
                                path: 'activity._user',
                                select: 'first_name last_name profile_pic role email',
                                match: {
                                    active: true
                                }
                            })
                            .lean();

                        if (!!activity && activity._project) {
                            await resourceService.deleteExpenseFromProject(activity, resourceId);
                        }

                        indexProject = (!!resource.activity) ? resource.activity.findIndex(a => a._id == activityEntityId) : -1;
                        if (indexProject >= 0) {
                            activity = resource.activity[indexProject];
                            await resourceService.addExpenseToProject(activity, resource, editedEntity?._project);
                        }
                    }
                    break;
                case 'quantity':
                    resource = await Resource.findById({ _id: resourceId }).select('stock activity').lean();
                    const indexQuantity = (!!resource.activity) ? resource.activity.findIndex(a => a._id == activityEntityId) : -1;
                    if (indexQuantity >= 0) {
                        const activity = resource.activity[indexQuantity];

                        let newBalance = resource.stock;
                        if (activity.add_inventory) {
                            newBalance -= activity.quantity + editedEntity.quantity;
                        } else {
                            newBalance += activity.quantity - editedEntity.quantity;
                        }

                        resource = await Resource.findByIdAndUpdate({
                                _id: resourceId
                            }, {
                                $set: {
                                    'activity.$[act].quantity': editedEntity?.quantity,
                                    'activity.$[act].edited_date': moment().format(),
                                    "stock": newBalance,
                                    "last_updated_date": moment().format()
                                }
                            },
                            {
                                arrayFilters: [{ "act._id": activityEntityId }],
                                new: true
                            })
                            .populate({
                                path: '_group',
                                select: 'group_name group_avatar workspace_name _members _admins',
                                match: {
                                    active: true
                                }
                            })
                            .populate({
                                path: '_created_by',
                                select: 'first_name last_name profile_pic role email',
                                match: {
                                    active: true
                                }
                            })
                            .populate({
                                path: 'activity._project',
                                select: 'title'
                            })
                            .populate({
                                path: 'activity._user',
                                select: 'first_name last_name profile_pic role email',
                                match: {
                                    active: true
                                }
                            })
                            .lean();
                    }
                    break;
                case 'date':
                    resource = await Resource.findByIdAndUpdate({
                            _id: resourceId
                        }, {
                            $set: {
                                'activity.$[act].date': editedEntity?.date,
                                'activity.$[act].edited_date': moment().format(),
                                "last_updated_date": moment().format()
                            }
                        },
                        {
                            arrayFilters: [{ "act._id": activityEntityId }],
                            new: true
                        })
                        .populate({
                            path: '_group',
                            select: 'group_name group_avatar workspace_name _members _admins',
                            match: {
                                active: true
                            }
                        })
                        .populate({
                            path: '_created_by',
                            select: 'first_name last_name profile_pic role email',
                            match: {
                                active: true
                            }
                        })
                        .populate({
                            path: 'activity._project',
                            select: 'title'
                        })
                        .populate({
                            path: 'activity._user',
                            select: 'first_name last_name profile_pic role email',
                            match: {
                                active: true
                            }
                        })
                        .lean();
                    
                    const indexDate = (!!resource.activity) ? resource.activity.findIndex(a => a._id == activityEntityId) : -1;
                    if (indexDate >=  0) {
                        const activityTmp = resource.activity[indexDate];
                        if (!activityTmp.add_inventory) {
                            resourceService.editExpenseDate(editedEntity?.date, activityTmp._project._id || activityTmp._project, resourceId, activityTmp._id)
                        }
                    }
                    break;
                case 'comment':
                    resource = await Resource.findByIdAndUpdate({
                            _id: resourceId
                        }, {
                            $set: {
                                'activity.$[act].comment': editedEntity?.comment,
                                'activity.$[act].edited_date': moment().format(),
                                "last_updated_date": moment().format()
                            }
                        },
                        {
                            arrayFilters: [{ "act._id": activityEntityId }],
                            new: true
                        })
                        .populate({
                            path: '_group',
                            select: 'group_name group_avatar workspace_name _members _admins',
                            match: {
                                active: true
                            }
                        })
                        .populate({
                            path: '_created_by',
                            select: 'first_name last_name profile_pic role email',
                            match: {
                                active: true
                            }
                        })
                        .populate({
                            path: 'activity._project',
                            select: 'title'
                        })
                        .populate({
                            path: 'activity._user',
                            select: 'first_name last_name profile_pic role email',
                            match: {
                                active: true
                            }
                        })
                        .lean();
                    
                    const indexComment = (!!resource.activity) ? resource.activity.findIndex(a => a._id == activityEntityId) : -1;
                    if (indexComment >=  0) {
                        const activityTmp = resource.activity[indexComment];
                        if (!activityTmp.add_inventory) {
                            resourceService.editExpenseComment(editedEntity?.comment, activityTmp._project._id || activityTmp._project, resourceId, activityTmp._id)
                        }
                    }

                    break;
                case 'add_inventory':
                    resource = await Resource.findById({ _id: resourceId }).select('stock activity').lean();
                    const indexAddInventory = (!!resource.activity) ? resource.activity.findIndex(a => a._id == activityEntityId) : -1;
                    if (indexAddInventory >= 0) {
                        const activity = resource.activity[indexAddInventory];

                        if (activity.add_inventory !== editedEntity.add_inventory) {
                            let newBalance = resource.stock;

                            if (editedEntity.add_inventory ) {
                                newBalance = newBalance + (activity.quantity * 2);
                            } else {
                                newBalance = newBalance - (activity.quantity * 2);
                            }

                            resource = await Resource.findByIdAndUpdate({
                                    _id: resourceId
                                }, {
                                    $set: {
                                        'activity.$[act].add_inventory': editedEntity?.add_inventory,
                                        'activity.$[act]._project': (editedEntity?.add_inventory) ? null : editedEntity._project,
                                        'activity.$[act].edited_date': moment().format(),
                                        "stock": newBalance,
                                        "last_updated_date": moment().format()
                                    }
                                },
                                {
                                    arrayFilters: [{ "act._id": activityEntityId }],
                                    new: true
                                })
                                .populate({
                                    path: '_group',
                                    select: 'group_name group_avatar workspace_name _members _admins',
                                    match: {
                                        active: true
                                    }
                                })
                                .populate({
                                    path: '_created_by',
                                    select: 'first_name last_name profile_pic role email',
                                    match: {
                                        active: true
                                    }
                                })
                                .populate({
                                    path: 'activity._project',
                                    select: 'title'
                                })
                                .populate({
                                    path: 'activity._user',
                                    select: 'first_name last_name profile_pic role email',
                                    match: {
                                        active: true
                                    }
                                })
                                .lean();
                        
                            if (editedEntity.add_inventory) {
                                resourceService.deleteExpenseFromProject(activity, resourceId);
                            }
                            // the expense is not added here because it needs a project to be selected.
                            // } else if (!!(editedEntity._project._id || editedEntity._project)) {
                            //     resourceService.addExpenseToProject(editedEntity, resource, (editedEntity._project._id || editedEntity._project));
                        }
                    }
                    break;
            }
            // Send status 200 response
            return res.status(200).json({
                message: 'Resource Activity Entity edited!',
                resource: resource
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    async removeActivityEntry(req: Request, res: Response, next: NextFunction) {
        // Fetch theresourceId & activityEntityId
        const { resourceId, activityEntityId } = req.params;

        try {
            let resource = await Resource.findById({
                    _id: resourceId
                }).select('stock activity').lean();

            const index = (!!resource.activity) ? resource.activity.findIndex(a => a._id == activityEntityId) : -1;
            if (index >=  0) {
                const activityTmp = resource.activity[index];

                await Resource.findByIdAndUpdate({
                        _id: resourceId
                    }, {
                        $pull: {
                            activity: {
                                _id: activityEntityId
                            }
                        }
                    }).lean();

                resource = await Resource.findByIdAndUpdate({
                        _id: resourceId
                    }, {
                        $set: {
                            "stock": (activityTmp.add_inventory)
                                ? resource.stock - activityTmp.quantity
                                : resource.stock + activityTmp.quantity,
                            "last_updated_date": moment().format()
                        }
                    }, {
                        new: true
                    })
                    .populate({
                        path: '_group',
                        select: 'group_name group_avatar workspace_name _members _admins',
                        match: {
                            active: true
                        }
                    })
                    .populate({
                        path: '_created_by',
                        select: 'first_name last_name profile_pic role email',
                        match: {
                            active: true
                        }
                    })
                    .populate({
                        path: 'activity._project',
                        select: 'title'
                    })
                    .populate({
                        path: 'activity._user',
                        select: 'first_name last_name profile_pic role email',
                        match: {
                            active: true
                        }
                    })
                    .lean();
                
                if (!!activityTmp._project && !activityTmp.add_inventory) {
                    resourceService.deleteExpenseFromProject(activityTmp, resourceId);
                }
            }

            // Send status 200 response
            return res.status(200).json({
                message: 'Resource Activity Entity deleted!',
                resource: resource
            });
        } catch (err) {
            console.log(err);
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }
}
