import { Column, Group, Portfolio, Post, User } from '../models';
import { Response, Request, NextFunction } from 'express';
import { sendError } from '../../utils';
import moment from 'moment';

/*  ===================
 *  -- Portfolio METHODS --
 *  ===================
 * */
export class PortfolioController {
    
    async getUserPortfolios(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req['userId'];
            
            // If either workspaceId or userId is null or not provided then we throw BAD REQUEST 
            if (!userId) {
                return res.status(400).json({
                    message: 'Please provide userId!'
                })
            }

            // Finding portfolios for the user of which they are a part of
            const portfolios = await Portfolio.find({ 
                    $or: [
                        { _members: userId },
                        { _created_by: userId }
                    ]
                })
                .sort('_id')
                .populate({ path: '_members', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_groups', select: 'group_name group_avatar _members _admins' })
                .populate({ path: '_content_mentions', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_posted_by', select: 'first_name last_name profile_pic role email' })
                .lean() || []

            // If there are no portfolios then we send error response
            if (!portfolios) {
                return sendError(res, new Error('Oops, no portfolios found!'), 'Portfolio not found, Invalid workspaceId or userId!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: `${portfolios.length} portfolios found.`,
                portfolios
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function fetches the portfolio details corresponding to the @constant portfolioId 
     * @param req - @constant portfolioId
     */
    async get(req: Request, res: Response) {
        try {

            const { portfolioId } = req.params;

            // If portfolioId is null or not provided then we throw BAD REQUEST 
            if (!portfolioId) {
                return res.status(400).json({
                    message: 'Please provide portfolioId!'
                });
            }

            // Find the Portfolio based on the portfolioId
            var portfolio = await Portfolio.findOne({
                    _id: portfolioId
                })
                .populate({ path: '_members', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_groups', select: 'group_name group_avatar _members _admins' })
                .populate({ path: '_content_mentions', select: 'first_name last_name profile_pic role email' })
                .lean();

            // Check if portfolio already exist with the same portfolioId
            if (!portfolio) {
                return sendError(res, new Error('Oops, portfolio not found!'), 'Portfolio not found, Invalid portfolioId!', 404);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: 'Portfolio found!',
                portfolio
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function creates the new portfolio in workspace
     * @constant userId
     */
    async create(req: Request, res: Response) {
        try {

            // Preparing the portfolio data
            const { portfolio_name } = req.body;
            const userId = req['userId'];

            // If portfolio_name is null or not provided then we throw BAD REQUEST 
            if (!portfolio_name) {
                return res.status(400).json({
                    message: 'Please provide portfolio_name!'
                });
            }

            let portfolio = await Portfolio.create({
                    portfolio_name: portfolio_name,
                    _members: [userId],
                    _created_by: userId
                });

            // Send the status 200 response
            return res.status(200).json({
                message: 'Portfolio Created Successfully!',
                portfolio: portfolio
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function is responsible for updating the portfolio data to the corresponding @constant portfolioId
     * @param req - @constant portfolioId 
     * It only Updates @portfolio_name and @description
     */
    async update(req: Request, res: Response) {
        try {
            const { portfolioId } = req.params;
            const { body } = req;

            // If portfolioId is null or not provided then we throw BAD REQUEST 
            if (!portfolioId || !body) {
                return res.status(400).json({
                    message: 'Please provide portfolioId and properties to update!'
                });
            }

            const portfolio: any = await Portfolio.findOneAndUpdate(
                    { _id: portfolioId },
                    { $set: body },
                    { new: true }
                )
                .populate({ path: '_members', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_groups', select: 'group_name group_avatar _members _admins' })
                .populate({ path: '_content_mentions', select: 'first_name last_name profile_pic role email' })
                .lean();

            if (!portfolio) {
                return sendError(res, new Error('Oops, portfolio not found!'), 'Portfolio not found, invalid portfolioId!', 404);
            }

            return res.status(200).json({
                message: `${portfolio.portfolio_name} portfolio was updated successfully!`,
                portfolio: portfolio
            });

        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function is responsible for updating the portfolio data to the corresponding @constant portfolioId
     * @param req - @constant portfolioId 
     */
    async updateContent(req: Request, res: Response) {
        try {
            const { portfolioId } = req.params;
            const { body: { portfolio } } = req;

            // If portfolioId is null or not provided then we throw BAD REQUEST 
            if (!portfolioId || !portfolio) {
                return res.status(400).json({
                    message: 'Please provide portfolioId and properties to update!'
                });
            }

            const portfolioData: any = await Portfolio.findOneAndUpdate(
                    { _id: portfolioId },
                    { $set: JSON.parse(portfolio) },
                    { new: true }
                )
                .populate({ path: '_members', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_groups', select: 'group_name group_avatar _members _admins' })
                .populate({ path: '_content_mentions', select: 'first_name last_name profile_pic role email' })
                .lean();

            if (!portfolioData) {
                return sendError(res, new Error('Oops, portfolio not found!'), 'Portfolio not found, invalid portfolioId!', 404);
            }

            return res.status(200).json({
                message: `${portfolioData.portfolio_name} portfolio was updated successfully!`,
                portfolio: portfolioData
            });

        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function is responsible for updating the portfolio data to the corresponding @constant portfolioId
     */
    async addGroup(req: Request, res: Response) {
        try {
            const { portfolioId } = req.params;
            const { groupId } = req.body;
            const userId = req['userId'];

            // If portfolioId is null or not provided then we throw BAD REQUEST 
            if (!portfolioId || !groupId) {
                return res.status(400).json({
                    message: 'Please provide portfolioId and groupId!'
                });
            }

            const group = await Group.findOne({
                $and: [
                    { $or: [{ _members: userId }, { _admins: userId }] },
                    {_id: groupId}
                ]})
                .select('group_name group_avatar _members _admins')
                .lean();

            if (!group) {
                return sendError(res, new Error('Oops, group not found!'), 'Group not found, invalid groupId or user is not part of the group!', 404);
            }

            const portfolio: any = await Portfolio.findOneAndUpdate(
                    { _id: portfolioId },
                    { 
                        $addToSet: {
                            _groups: groupId
                        }
                    },
                    { new: true }
                )
                .populate({ path: '_members', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_groups', select: 'group_name group_avatar _members _admins' })
                .populate({ path: '_content_mentions', select: 'first_name last_name profile_pic role email' })
                .lean();

            if (!portfolio) {
                return sendError(res, new Error('Oops, portfolio not found!'), 'Portfolio not found, invalid portfolioId!', 404);
            }

            return res.status(200).json({
                message: `Group added to portfolio successfully!`,
                group: group
            });

        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function is responsible for updating the portfolio data to the corresponding @constant portfolioId
     */
    async removeGroup(req: Request, res: Response) {
        try {
            const { portfolioId } = req.params;
            const { groupId } = req.body;

            // If portfolioId is null or not provided then we throw BAD REQUEST 
            if (!portfolioId || !groupId) {
                return res.status(400).json({
                    message: 'Please provide portfolioId and groupId!'
                });
            }

            const portfolio: any = await Portfolio.findOneAndUpdate(
                    { _id: portfolioId },
                    { 
                        $pull: { _groups: groupId }
                    },
                    { new: true }
                )
                .populate({ path: '_members', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_groups', select: 'group_name group_avatar _members _admins' })
                .populate({ path: '_content_mentions', select: 'first_name last_name profile_pic role email' })
                .lean();

            if (!portfolio) {
                return sendError(res, new Error('Oops, portfolio not found!'), 'Portfolio not found, invalid portfolioId!', 404);
            }

            return res.status(200).json({
                message: `Group removed from portfolio successfully!`,
                portfolio: portfolio
            });

        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function is responsible for updating the portfolio data to the corresponding @constant portfolioId
     */
    async addManager(req: Request, res: Response) {
        try {
            const { portfolioId } = req.params;
            const { assigneeId } = req.body;

            // If portfolioId is null or not provided then we throw BAD REQUEST 
            if (!portfolioId || !assigneeId) {
                return res.status(400).json({
                    message: 'Please provide portfolioId and assigneeId!'
                });
            }

            const portfolio: any = await Portfolio.findOneAndUpdate(
                    { _id: portfolioId },
                    { 
                        $addToSet: {
                            _members: assigneeId
                        }
                    },
                    { new: true }
                )
                .populate({ path: '_members', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_groups', select: 'group_name group_avatar _members _admins' })
                .populate({ path: '_content_mentions', select: 'first_name last_name profile_pic role email' })
                .lean();

            if (!portfolio) {
                return sendError(res, new Error('Oops, portfolio not found!'), 'Portfolio not found, invalid portfolioId!', 404);
            }

            return res.status(200).json({
                message: `Manager added to portfolio successfully!`,
                portfolio: portfolio
            });

        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function is responsible for updating the portfolio data to the corresponding @constant portfolioId
     */
    async removeManager(req: Request, res: Response) {
        try {
            const { portfolioId } = req.params;
            const { assigneeId } = req.body;

            // If portfolioId is null or not provided then we throw BAD REQUEST 
            if (!portfolioId || !assigneeId) {
                return res.status(400).json({
                    message: 'Please provide portfolioId and assigneeId!'
                });
            }

            const portfolio: any = await Portfolio.findOneAndUpdate(
                    { _id: portfolioId },
                    { 
                        $pull: { _members: assigneeId }
                    },
                    { new: true }
                )
                .populate({ path: '_members', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_groups', select: 'group_name group_avatar _members _admins' })
                .populate({ path: '_content_mentions', select: 'first_name last_name profile_pic role email' })
                .lean();

            if (!portfolio) {
                return sendError(res, new Error('Oops, portfolio not found!'), 'Portfolio not found, invalid portfolioId!', 404);
            }

            return res.status(200).json({
                message: `Manager removed from portfolio successfully!`,
                portfolio: portfolio
            });

        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function deletes the portfolio from the database to the corresponding @constant portfolioId
     * @param req - @constant portfolioId
     * @param res 
     */
    async remove(req: Request, res: Response) {

        const { portfolioId } = req.params;

        try {
            // If portfolioId is null or not provided then we throw BAD REQUEST 
            if (!portfolioId) {
                return res.status(400).json({
                    message: 'Please provide portfolioId!'
                });
            }

            const portfolio: any = await Portfolio.findOne({ _id: portfolioId })
                .select('_id').lean();

            // If portfolioId is null or not provided then we throw BAD REQUEST 
            if (!portfolio) {
                return res.status(400).json({
                    message: 'There is no existing portfolio with the portfolioId provided!'
                });
            }

            // Remove the users´ favorite portfolios
            await User.updateMany({}, {
                $pull: { 'stats.favorite_portfolios': portfolioId }
            });

            // Find the portfolio and remove it from the database
            await Portfolio.findByIdAndDelete(portfolioId);

            // Send the status 200 response
            return res.status(200).json({
                message: 'Portfolio deleted successfully!'
            });
        } catch (error) {
            return sendError(res, error);
        }
    };

    /**
     * This function is responsible for updating the image for the particular group
     * @param { userId, fileName }req 
     * @param res 
     */
    async updateImage(req: Request, res: Response, next: NextFunction) {

        // Fetch the groupId
        const { portfolioId } = req.params;
        const isBackbroundImage = req.body.fileData.isBackbroundImage

        // Fetch the fileName from fileHandler middleware
        const fileName = req['fileName'];

        try {

            let update = {};
            if (isBackbroundImage) {
                update = {
                    background_image: fileName
                };
            } else {
                update = {
                    portfolio_avatar: fileName
                };
            }

            // Find the group and update their respective group avatar
            const portfolio = await Portfolio.findByIdAndUpdate({
                    _id: portfolioId
                }, update, {
                    new: true
                })
                .populate({ path: '_members', select: 'first_name last_name profile_pic role email' })
                .populate({ path: '_groups', select: 'group_name group_avatar _members _admins' })
                .populate({ path: '_content_mentions', select: 'first_name last_name profile_pic role email' })
                .lean();

            // Send status 200 response
            return res.status(200).json({
                message: 'Portfolio updated!',
                portfolio: portfolio
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };

    /**
     * This function fetches the portfolio details corresponding to the @constant portfolioId 
     * @param req - @constant portfolioId
     */
    async getAllGroupsMembers(req: Request, res: Response) {
        try {

            const { portfolioId } = req.params;

            // If portfolioId is null or not provided then we throw BAD REQUEST 
            if (!portfolioId) {
                return res.status(400).json({
                    message: 'Please provide portfolioId!'
                });
            }

            // Find the Portfolio based on the portfolioId
            let portfolio = await Portfolio.findOne({
                    _id: portfolioId
                })
                .select('_groups')
                .lean();

            // Check if portfolio already exist with the same portfolioId
            if (!portfolio) {
                return sendError(res, new Error('Oops, portfolio not found!'), 'Portfolio not found, Invalid portfolioId!', 404);
            }

            let users = [];
            const usersTmp = await User.find({
                    $and: [
                        { _groups: { $in : portfolio?._groups }},
                        { active: true }
                    ]
                })
                .select('_id first_name last_name email current_position active role profile_pic out_of_office')
                .lean() || []

            users = users.concat(usersTmp);
            users = await users?.filter((user, index) => (users?.findIndex(u => u?._id == user?._id) == index));

            // Send the status 200 response
            return res.status(200).json({
                message: `Portfolio group members found!`,
                users: users
            })
        } catch (err) {
            return sendError(res, err);
        }
    };

    /**
     * This function fetches the posts of the group with specific dates
     * @param req
     */
    async getTasksBetweenDates(req: Request, res: Response) {
        try {

            const { portfolioId } = req.params;
            const { query: { startDate, endDate } } = req;

            // Find the Portfolio based on the portfolioId
            let portfolio = await Portfolio.findOne({
                    _id: portfolioId
                })
                .select('_groups')
                .lean();

            // Check if portfolio already exist with the same portfolioId
            if (!portfolio) {
                return sendError(res, new Error('Oops, portfolio not found!'), 'Portfolio not found, Invalid portfolioId!', 404);
            }

            // Find the Group based on the groupId
            const posts = await Post.find({
                    $and: [
                        { _group: { $in : portfolio?._groups }},
                        { type: 'task' },
                        { 'task.due_to': { $gte: startDate, $lte: endDate} }
                    ]
                })
                .select('task.status task.due_to _assigned_to task.allocation')
                .lean() || [];

            // Send the status 200 response
            return res.status(200).json({
                message: 'Posts found!',
                posts: posts
            });
        } catch (err) {
            return sendError(res, err);
        }
    };

    // get all existing project columns in a portfolio
    async getAllPortfolioProjectColumns(req: Request, res: Response, next: NextFunction) {
        try {
            // Fetch portfolioId from the query
            const { portfolioId } = req.params;

            let columns = [];
            if (portfolioId) {
                // Only groups where user is manager
                const portfolio = await Portfolio.findOne({ _id: portfolioId })
                    .select('_groups')
                    .lean() || [];

                columns = await Column.find({
                        $and: [
                            { '_group': { $in: portfolio?._groups }},
                            { project_type: true },
                            { archived: { $ne: true }}
                        ]
                    }).lean() || [];

                columns = await Column.populate(columns, [
                        { path: '_group' },
                        { path: 'budget.expenses._user' },
                        { path: 'permissions._members', select: 'first_name last_name profile_pic role email' }
                    ]);
            }

            // Send the status 200 response
            return res.status(200).json({
                message: 'Column obtained Successfully!',
                columns: columns
            });
        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    };

    /**
     * This function is responsible for fetching the posts of a workspace
     * @param req 
     * @param res 
     * @param next 
     */
    async getPortfolioTasks(req: Request, res: Response, next: NextFunction) {

        const { params: { portfolioId }, query: { numDays } } = req;

        const comparingDate = moment().local().subtract(+numDays, 'days').format('YYYY-MM-DD');
        const today = moment().subtract(1, 'days').endOf('day').format();

        // Only groups where user is manager
        const portfolio = await Portfolio.findOne({ _id: portfolioId })
            .select('_groups')
            .lean() || [];

        let tasks = await Post.find({
            $and: [
                { _group: { $in: portfolio?._groups } },
                { type: 'task' },
                { 'task.due_to': { $gte: comparingDate } }
            ]
            })
            .select('task.status')
            .lean() || [];
        
        let overdueTasks = await Post.find({
                $and: [
                { _group: { $in: portfolio?._groups } },
                { type: 'task' },
                { 'task.due_to': { $gte: comparingDate, $lt: today } }
                ]
            })
            .select('task.status')
            .lean() || [];

        // // Send status 200 response
        return res.status(200).json({
            message: 'Posts fetched!',
            tasks: tasks,
            overdueTasks: overdueTasks
        });
    }

    /**
     * This function is responsible for fetching the posts of a workspace
     * @param req 
     * @param res 
     * @param next 
     */
    async getAllPortfolioTasksStats(req: Request, res: Response, next: NextFunction) {

        const { params: { portfolioId } } = req;

        // Only groups where user is manager
        const portfolio = await Portfolio.findOne({ _id: portfolioId })
            .select('_groups')
            .lean() || [];

        let completed = await Post.find({
                $and: [
                    { _group: { $in: portfolio?._groups } },
                    { type: 'task' },
                    { 'task.status': 'done' }
                ]
            }).countDocuments() || 0;
        
        let numTasks = await Post.find({
                $and: [
                    { _group: { $in: portfolio?._groups } },
                    { type: 'task' },
                ]
            }).countDocuments() || 0;

        // // Send status 200 response
        return res.status(200).json({
            message: 'Stats fetched!',
            completed: completed,
            numTasks: numTasks
        });
    }

    async getTodayTasks(req: Request, res: Response, next: NextFunction) {
        try {

            const { portfolioId } = req.params;
            const { query: { userId } } = req;

            // If userId is not found
            if (!userId || !portfolioId) {
                return sendError(res, new Error('Unable to find the user, either userId is invalid or you have made an unauthorized request!'), 'Unable to find the user, either userId is invalid or you have made an unauthorized request!', 404);
            }

            // Generate the actual time
            const startOfDay = moment().startOf('day').format('YYYY-MM-DD');

            // Generate the +24h time
            const endOfDay = moment().endOf('day').format('YYYY-MM-DD');

            // Only groups where user is manager
            const portfolio = await Portfolio.findOne({ _id: portfolioId })
                .select('_groups')
                .lean() || [];

            // Fetch users task for today
            const tasks = await Post.find({
                    $and: [
                        { _assigned_to: userId },
                        { _group: { $in: portfolio?._groups }},
                        { type: 'task' },
                        { 'task.due_to': { $gte: startOfDay, $lte: endOfDay }},
                        { 'task.is_template': { $ne: true }},
                        {
                            $or: [
                                { 'task.status': 'to do' },
                                { 'task.status': 'in progress' },
                                { 'task.status': 'done' }
                            ]
                        }
                    ]
                })
                .sort('-task.due_to')
                .populate('_group', 'group_name group_avatar _members _admins')
                .populate('_posted_by', 'first_name last_name profile_pic role email')
                .populate('_assigned_to', 'first_name last_name profile_pic role email')
                .populate('_followers', 'first_name last_name profile_pic role email')
                .populate('_liked_by', 'first_name last_name profile_pic role email')
                .lean();

            // Send status 200 response
            return res.status(200).json({
                message: 'Today\'s tasks found!',
                tasks: tasks
            });

        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    async getOverdueTasks(req: Request, res: Response, next: NextFunction) {
        try {
            const { portfolioId } = req.params;
            const { query: { userId } } = req;

            // If userId is not found
            if (!userId || !portfolioId) {
                return sendError(res, new Error('Unable to find the user, either userId is invalid or you have made an unauthorized request!'), 'Unable to find the user, either userId is invalid or you have made an unauthorized request!', 404);
            }

            // Generate the actual time
            const today = moment().format('YYYY-MM-DD');

            // Only groups where user is manager
            const portfolio = await Portfolio.findOne({ _id: portfolioId })
                .select('_groups')
                .lean() || [];

            // Fetch the tasks posts
            const tasks = await Post.find({
                    $and: [
                        { _assigned_to: userId },
                        { _group: { $in: portfolio?._groups }},
                        { type: 'task' },
                        { 'task.due_to': { $lt: today }},
                        { 'task.is_template': { $ne: true }},
                        {
                            $or: [
                                { 'task.status': 'to do' },
                                { 'task.status': 'in progress' }
                            ]
                        }
                    ]
                })
                .sort('-task.due_to')
                .populate('_group', 'group_name group_avatar _members _admins')
                .populate('_posted_by', 'first_name last_name profile_pic role email')
                .populate('_assigned_to', 'first_name last_name profile_pic role email')
                .populate('_followers', 'first_name last_name profile_pic role email')
                .populate('_liked_by', 'first_name last_name profile_pic role email')
                .lean();

            // Send status 200 response
            return res.status(200).json({
                message: 'Overdue tasks found!',
                tasks: tasks
            });

        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    async getThisWeekTasks(req: Request, res: Response, next: NextFunction) {
        try {

            const { portfolioId } = req.params;
            const { query: { userId } } = req;

            // If userId is not found
            if (!userId || !portfolioId) {
                return sendError(res, new Error('Unable to find the user, either userId is invalid or you have made an unauthorized request!'), 'Unable to find the user, either userId is invalid or you have made an unauthorized request!', 404);
            }

            // Fetch this week's task
            // Generate the today
            const tomorrow = moment().add(1, 'days').startOf('day').format('YYYY-MM-DD');

            // Generate the date for the end of the week
            const endOfWeek = moment().add(1, 'days').endOf('day').endOf('isoWeek').format('YYYY-MM-DD');

            // Only groups where user is manager
            const portfolio = await Portfolio.findOne({ _id: portfolioId })
                .select('_groups')
                .lean() || [];

            // Fetch the tasks posts
            const tasks = await Post.find({
                    $and: [
                        { _assigned_to: userId },
                        { _group: { $in: portfolio?._groups }},
                        { type: 'task' },
                        { 'task.due_to': { $gte: tomorrow, $lte: endOfWeek }},
                        { 'task.is_template': { $ne: true }},
                        {
                            $or: [
                                { 'task.status': 'to do' },
                                { 'task.status': 'in progress' },
                                { 'task.status': 'done' }
                            ]
                        }
                    ]
                })
                .sort('-task.due_to')
                .populate('_group', 'group_name group_avatar _members _admins')
                .populate('_posted_by', 'first_name last_name profile_pic role email')
                .populate('_assigned_to', 'first_name last_name profile_pic role email')
                .populate('_followers', 'first_name last_name profile_pic role email')
                .populate('_liked_by', 'first_name last_name profile_pic role email')
                .lean();

            // Send status 200 response
            return res.status(200).json({
                message: 'This weeks\' tasks found!',
                tasks: tasks
            });

        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }


    async getNextWeekTasks(req: Request, res: Response, next: NextFunction) {
        try {
            const { portfolioId } = req.params;
            const { query: { userId } } = req;

            // If userId is not found
            if (!userId || !portfolioId) {
                return sendError(res, new Error('Unable to find the user, either userId is invalid or you have made an unauthorized request!'), 'Unable to find the user, either userId is invalid or you have made an unauthorized request!', 404);
            }

            // Generate the date for the end of the week
            const endOfWeek = moment().add(1, 'days').endOf('day').endOf('isoWeek').format('YYYY-MM-DD');

            // Generate the date for the end of the next week
            const endOfNextWeek = moment().endOf('isoWeek').add(1, 'days').endOf('day').endOf('isoWeek').format('YYYY-MM-DD');

            // Only groups where user is manager
            const portfolio = await Portfolio.findOne({ _id: portfolioId })
                .select('_groups')
                .lean() || [];

            // Fetch the tasks posts
            const tasks = await Post.find({
                    $and: [
                        { _assigned_to: userId },
                        { _group: { $in: portfolio?._groups }},
                        { type: 'task' },
                        {'task.due_to': { $gt: endOfWeek, $lte: endOfNextWeek }},
                        { 'task.is_template': { $ne: true }},
                        {
                            $or: [
                                { 'task.status': 'to do' },
                                { 'task.status': 'in progress' },
                                { 'task.status': 'done' }
                            ]
                        }
                    ]
                })
                .sort('-task.due_to')
                .populate('_group', 'group_name group_avatar _members _admins')
                .populate('_posted_by', 'first_name last_name profile_pic role email')
                .populate('_assigned_to', 'first_name last_name profile_pic role email')
                .populate('_followers', 'first_name last_name profile_pic role email')
                .populate('_liked_by', 'first_name last_name profile_pic role email')
                .lean();

            // Send status 200 response
            return res.status(200).json({
                message: 'Next weeks\' tasks found!',
                tasks: tasks
            });

        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    async getFutureTasks(req: Request, res: Response, next: NextFunction) {
        try {

            const { portfolioId } = req.params;
            const { query: { userId } } = req;

            // If userId is not found
            if (!userId || !portfolioId) {
                return sendError(res, new Error('Unable to find the user, either userId is invalid or you have made an unauthorized request!'), 'Unable to find the user, either userId is invalid or you have made an unauthorized request!', 404);
            }

            // Generate the +14days from today time
            const todayPlus14Days = moment().add(14, 'days').endOf('day').format('YYYY-MM-DD');

            // Only groups where user is manager
            const portfolio = await Portfolio.findOne({ _id: portfolioId })
                .select('_groups')
                .lean() || [];

            // Fetch the tasks posts
            const tasks = await Post.find({
                    $and:[
                        { _assigned_to: userId },
                        { _group: { $in: portfolio?._groups }},
                        { type: 'task' },
                        { 'task.is_template': { $ne: true }},
                        {
                            $or: [
                                { 'task.due_to': { $gte: todayPlus14Days }},
                                { 'task.due_to': null }
                            ]
                            
                        },
                        {
                            $or: [
                                { 'task.status': 'to do' },
                                { 'task.status': 'in progress' }
                            ]
                        }
                    ]
                })
                .sort('-task.due_to')
                .populate('_group', 'group_name group_avatar _members _admins')
                .populate('_posted_by', 'first_name last_name profile_pic role email')
                .populate('_assigned_to', 'first_name last_name profile_pic role email')
                .populate('_followers', 'first_name last_name profile_pic role email')
                .populate('_liked_by', 'first_name last_name profile_pic role email')
                .lean();

            // Send status 200 response
            return res.status(200).json({
                message: 'Future tasks found!',
                tasks: tasks
            });

        } catch (err) {
            return sendError(res, new Error(err), 'Internal Server Error!', 500);
        }
    }
}
