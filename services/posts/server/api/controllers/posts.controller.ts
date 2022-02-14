import { Response, Request, NextFunction } from "express";
import { FlowService, PostService, TagsService } from '../services';
import moment from "moment/moment";
import { sendErr } from '../utils/sendError';
import { Group, Post } from "../models";

const ObjectId = require('mongoose').Types.ObjectId;

const postService = new PostService();

const tagsService = new TagsService();

const flowService = new FlowService();

export class PostController {

    /**
     * This function is used to validate an ObjectId
     * @param id
     */
    validateId(id: any) {
        var stringId: String = id.toString();
        if (!ObjectId.isValid(stringId)) {
            return false;
        }
        var result = new ObjectId(stringId);
        if (result.toString() != stringId) {
            return false;
        }
        return true;
    }

    /**
     * This function is responsible to add a post
     * @param { post } req
     */
    async add(req: Request, res: Response, next: NextFunction) {

        // Post Object From request
        const { post, isShuttleTasksModuleAvailable } = req.body;

        // Fetch userId from the request
        const userId = req['userId'];

        // Call servide function for adding the post
        const postData = await this.callAddPostService(post, userId, isShuttleTasksModuleAvailable == 'true')
            .catch((err) => {
                return sendErr(res, new Error(err), 'Insufficient Data, please check into error stack!', 400);
            })

        // Send Status 200 response
        return res.status(200).json({
            message: 'Post Added Successfully!',
            post: postData
        });
    }

    async callAddPostService(post: any, userId: string, isShuttleTasksModuleAvailable: boolean) {

        // Call Service function to change the assignee
        post = await postService.addPost(post, userId);

        if (post.type === 'task') {
            // Execute Automation Flows
            post = await this.executeAutomationFlows((post._group._id || post._group), post, userId, true, isShuttleTasksModuleAvailable);
        }

        return post;
    }


    /**
     * This function is responsible for editing a post
     * @param { post } req
     * @param res 
     * @param next 
     */
    async edit(req: Request, res: Response, next: NextFunction) {

        // Post Object From request
        const { body: { post }, params: { postId } } = req;

        // Call service function to edit
        const updatedPost = await postService.editPost(post, postId)
            .catch((err) => {
                if (err == null) {
                    return sendErr(res, null, 'User not allowed to edit this post!', 403);
                }
                return sendErr(res, new Error(err), 'Insufficient Data, please check into error stack!', 400);
            })

        // Send Status 200 response
        return res.status(200).json({
            message: 'Post Edited Successfully!',
            post: updatedPost
        });
    }

    /**
     * This function is used to retrieve a post
     * @param req 
     * @param res 
     * @param next 
     */
    async get(req: Request, res: Response, next: NextFunction) {
        try {

            let { postId } = req.params;

            // Call service function to get
            const post = await postService.get(postId);

            return res.status(200).json({
                message: 'Post Found!',
                post: post
            });
        } catch (error) {
            return sendErr(res, new Error(error), 'Internal Server Error', 500);
        }
    }


    /**
     * This function is responsible for removing a post
     * @param req 
     * @param res 
     * @param next 
     */
    async remove(req: Request, res: Response, next: NextFunction) {
        try {

            // Retrieving data from request 
            const { postId } = req.params;
            const userId: any = req['userId'];

            // Calling service function to remove post
            const post = await postService.remove(userId, postId);

            // Returning status 200 response
            return res.status(200).json({
                message: 'Post removed successfully',
                post: post
            });

        } catch (error) {
            if (error == null) {
                return sendErr(res, null, 'User not allowed to remove this post!', 403)
            }
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }

    /**
     * This function fetches the 5 recent posts present inside a group
     * @param { query: { groupId, lastPostId } } req 
     * @param res 
     * @param next 
     */
    async getPosts(req: Request, res: Response, next: NextFunction) {

        // Fetch groupId and lastPostId from request
        var { groupId, lastPostId, type, pinned, filters } = req.query;

        // If type is not defined, then fetch all the posts by default
        if (!type || type == '' || type === "") {
            type = 'all'
        }

        // If groupId is not present, then return error
        if (!groupId) {
            return sendErr(res, new Error('Please provide the groupId as the query parameter'), 'Please provide the groupId as the query paramater!', 400);
        }

        // Fetch the next 5 recent posts
        await postService.getPosts(groupId, pinned == 'true', type, lastPostId, filters)
            .then((posts) => {

                // If lastPostId is there then, send status 200 response
                if (lastPostId)
                    return res.status(200).json({
                        message: `The next ${posts.length} most recent posts!`,
                        posts: posts
                    });

                // If lastPostId is not there then, send status 200 response
                else
                    return res.status(200).json({
                        message: `The first ${posts.length} most recent posts!`,
                        posts: posts
                    });
            })
            .catch((err) => {

                // If there's an error send bad request
                return sendErr(res, new Error(err), 'Unable to fetch the posts, kindly check the stack trace for error', 400)
            });
    }

    /**
     * This function fetches the archived tasks present inside a group
     * @param { query: { groupId } } req 
     * @param res 
     * @param next 
     */
    async getArchivedTasks(req: Request, res: Response, next: NextFunction) {

        // Fetch groupId and lastPostId from request
        var { groupId } = req.query;

        // If groupId is not present, then return error
        if (!groupId) {
            return sendErr(res, new Error('Please provide the groupId as the query parameter'), 'Please provide the groupId as the query paramater!', 400);
        }

        // Fetch the next 5 recent posts
        await postService.getArchivedTasks(groupId.toString())
            .then((posts) => {
                return res.status(200).json({
                    message: `The archived tasks!`,
                    posts: posts
                });
            })
            .catch((err) => {
                // If there's an error send bad request
                return sendErr(res, new Error(err), 'Unable to fetch the archived tasks, kindly check the stack trace for error', 400)
            });
    }

    /**
     * This function fetches the North Star tasks present inside multiple groups
     * @param { query: { groups } } req 
     * @param res 
     * @param next 
     */
    async getNorthStarTasks(req: Request, res: Response, next: NextFunction) {
        // Fetch groupId and lastPostId from request
        var { groups } = req.query;

        // If groupId is not present, then return error
        if (!groups) {
            return sendErr(res, new Error('Please provide the groups as the query parameter'), 'Please provide the groups as the query paramater!', 400);
        }

        await postService.getNorthStarTasks(groups)
            .then((posts) => {
                // If lastPostId is there then, send status 200 response
                return res.status(200).json({
                    message: `The North Star Tasks!`,
                    posts: posts
                });
            })
            .catch((err) => {
                // If there's an error send bad request
                return sendErr(res, new Error(err), 'Unable to fetch the north star tasks, kindly check the stack trace for error', 400)
            });
    }


    /**
     * This function is used to like a post
     * @param req 
     * @param res 
     * @param next 
     */
    async like(req: Request, res: Response, next: NextFunction) {
        // Fetch postId from request
        const { params: { postId } } = req;

        // Fetch userId from the request
        const userId = req['userId'];

        // Call Service function to like a post
        let data: any = await postService.like(userId, postId)
            .catch((err) => {
                return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
            })

        // Send status 200 response
        return res.status(200).json({
            message: 'Post Successfully Liked',
            post: data.post,
            user: data.user
        });
    }


    /**
     * This function is used to unlike a post
     * @param req 
     * @param res 
     * @param next 
     */
    async unlike(req: Request, res: Response, next: NextFunction) {
        // Fetch postId from the request
        const { params: { postId } } = req;

        // Fetch userId from the request
        const userId = req['userId'];

        // Call Service function to unlike a post
        let data: any = await postService.unlike(userId, postId)
            .catch((err) => {
                return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
            })

        // Send status 200 response
        return res.status(200).json({
            message: 'Post Successfully Unliked',
            post: data.post,
            user: data.user
        });
    }


    /**
     * This function is used to like a post
     * @param req 
     * @param res 
     * @param next 
     */
    async follow(req: Request, res: Response, next: NextFunction) {
        // Fetch postId from request
        const { params: { postId } } = req;

        // Fetch userId from the request
        const userId = req['userId'];

        // Call Service function to like a post
        let data: any = await postService.follow(userId, postId)
            .catch((err) => {
                return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
            })

        // Send status 200 response
        return res.status(200).json({
            message: 'Post Successfully Liked',
            follow: 'OK'
        });
    }


    /**
     * This function is used to unlike a post
     * @param req 
     * @param res 
     * @param next 
     */
    async unfollow(req: Request, res: Response, next: NextFunction) {
        // Fetch postId from the request
        const { params: { postId } } = req;

        // Fetch userId from the request
        const userId = req['userId'];

        // Call Service function to unlike a post
        await postService.unfollow(userId, postId)
            .catch((err) => {
                return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
            })

        // Send status 200 response
        return res.status(200).json({
            message: 'Post Successfully Unliked',
            unfollow: 'OK'
        });
    }

    /**
     * This function is used to retrieve all of this month's tasks
     * @param req 
     * @param res 
     * @param next 
     */
    async getThisMonthTasks(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req['userId'];

            // Call service function to retrieve this months task
            const data = await postService.getThisMonthTasks(userId);

            // Send status 200 response
            return res.status(200).json(data);
        } catch (error) {
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }


    /**
     * This function is used to get first 10 tasks for this week
     * @param req 
     * @param res 
     * @param next 
     */
    async getThisWeekTasks(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req['userId'];

            // Call service function to retrieve this week's task
            const data = await postService.getThisWeekTasks(userId);

            // Send status 200 response
            return res.status(200).json(data);
        } catch (error) {
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }


    /**
     * This function is used to get next 5 tasks for this week
     * @param req 
     * @param res 
     * @param next 
     */
    async getNextTasks(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req['userId'];
            const { lastTaskId } = req.query;

            // Service function to get next 5 tasks for this week
            const data = await postService.getNextTasks(userId, lastTaskId);

            // Status 200 response status
            return res.status(200).json(data);
        } catch (error) {
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }


    /**
     * This function is used to get this month's events
     * @param req 
     * @param res 
     * @param next 
     */
    async getThisMonthEvents(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req['userId'];

            // Call service function to get events
            const data = await postService.getThisMonthsEvents(userId);

            // Send status 200 response
            return res.status(200).json(data);
        } catch (error) {
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }


    /**
     * This function is used to get first 10 events of this week
     * @param req 
     * @param res 
     * @param next 
     */
    async getThisWeekEvents(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req['userId'];

            // Call service function to get events
            const data = await postService.getThisWeekEvents(userId);

            // Send status 200 response
            return res.status(200).json(data);
        } catch (error) {
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }


    /**
     * This function is used to get next 5 events for this week
     * @param req 
     * @param res 
     * @param next 
     */
    async getNextEvents(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req['userId'];
            const { lastEventIId } = req.query;

            // Call service function to get events
            const data = await postService.getNextEvents(userId, lastEventIId);

            // Send status 200 response
            return res.status(200).json(data);
        } catch (error) {
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for removing an assignee from the post
     * @param req 
     * @param res 
     * @param next 
     */
    async removeAssignee(req: Request, res: Response, next: NextFunction) {

        // Fetch Data from request
        const { params: { postId }, body: { assigneeId } } = req;

        // Fetch userId from the request
        const userId = req['userId'];

        // Call Service function to remove the assignee
        const post = await postService.removeAssignee(postId, assigneeId, userId)
            .catch((err) => {
                return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
            })

        // Send status 200 response
        return res.status(200).json({
            message: 'Task assignee updated!',
            post: post
        });
    }

    /**
     * This function is responsible for changing the task assignee
     * @param req 
     * @param res 
     * @param next 
     */
    async addAssignee(req: Request, res: Response, next: NextFunction) {

        // Fetch Data from request
        const { params: { postId }, body: { assigneeId, groupId, isShuttleTasksModuleAvailable } } = req;

        // Fetch userId from the request
        const userId = req['userId'];

        const post = await this.callAddAssigneeService(postId, assigneeId, userId, groupId, isShuttleTasksModuleAvailable)
            .catch((err) => {
                return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
            })
        
        await postService.triggerToZap(postId,assigneeId,'new_task');

        // Send status 200 response
        return res.status(200).json({
            message: 'Task assignee updated!',
            post: post
        });
    }

    async callAddAssigneeService(postId: string, assigneeId: string, userId: string, groupId: string, isShuttleTasksModuleAvailable: boolean) {

        // Call Service function to change the assignee
        let post = await postService.addAssignee(postId, assigneeId, userId);

        // Execute Automation Flows
        post = await this.executeAutomationFlows(groupId, post, userId, false, isShuttleTasksModuleAvailable);

        if (post._assigned_to) {
            const index = post._assigned_to.findIndex(assignee => assignee._id == assigneeId);
            if (index < 0) {
                post._assigned_to.push(assigneeId);
            }
        } else {
            post._assigned_to = [assigneeId];
        }

        post = await postService.populatePostProperties(post);

        return post;
    }

    /**
     * This function is responsible for changing the task assignee
     * @param req 
     * @param res 
     * @param next 
     */
    async changeTaskAssignee(req: Request, res: Response, next: NextFunction) {

        // Fetch Data from request
        const { params: { postId }, body: { assigneeId, isShuttleTasksModuleAvailable } } = req;

        // Fetch userId from the request
        const userId = req['userId'];

        const post = await this.callChangeTaskAssigneeService(postId, assigneeId, userId, isShuttleTasksModuleAvailable)
            .catch((err) => {
                return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
            })

        // Send status 200 response
        return res.status(200).json({
            message: 'Task assignee updated!',
            post: post
        });
    }

    async callChangeTaskAssigneeService(postId: string, assigneeId: string, userId: string, isShuttleTasksModuleAvailable: boolean) {
        // Call Service function to change the assignee
        let post = await postService.changeTaskAssignee(postId, assigneeId, userId);

        // Execute Automation Flows
        post = await this.executeAutomationFlows((post._group || post._group._id), post, userId, false, isShuttleTasksModuleAvailable);

        post.task._assigned_to = assigneeId;

        post = await postService.populatePostProperties(post);

        return post;
    }

    /**
     * This function is responsible for changing the task due date
     * @param req 
     * @param res 
     * @param next 
     */
    async changeTaskDueDate(req: Request, res: Response, next: NextFunction) {

        // Fetch Data from request
        const { params: { postId }, body: { date_due_to } } = req;

        // Call Service function to change the assignee
        const post = await postService.changeTaskDueDate(postId, date_due_to)
            .catch((err) => {
                return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
            })

        // Send status 200 response
        return res.status(200).json({
            message: 'Task due date updated!',
            post: post
        });
    }

    /**
     * This function is responsible for changing the task due date
     * @param req 
     * @param res 
     * @param next 
     */
    async updateGanttTasksDates(req: Request, res: Response, next: NextFunction) {

        // Fetch Data from request
        const { params: { postId }, body: { date_due_to, start_date, s_days, e_days, group_id } } = req;

        try {
            async function update(p_Id, d_date, s_date , s_day, e_day, rec){
                if (s_day != 0){
                    var post = await postService.changeTaskDate(p_Id,'start_date',s_date)
                    .catch((err) => {
                        return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
                    })
                    
                }
                
                if (e_day != 0){
                    var post = await postService.changeTaskDueDate(p_Id, d_date)
                    .catch((err) => {
                        return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
                    })
    
                    if(post?.task?._dependent_child && post?.task?._dependent_child.length>0){
                        
                        for( var i=0;i<post?.task?._dependent_child.length;i++){
                            const childpost = await postService.get(post?.task?._dependent_child[i]);
                            if(childpost){
                                var newEndDate = moment(childpost?.task?.due_to).add(e_day,'days');
                                var newStartDate = moment(childpost?.task?.start_date).add(e_day,'days');
                                await update(post?.task?._dependent_child[i],moment(newEndDate).format(),moment(newStartDate).format(),e_day,e_day,true);
                            }
                        }
    
                    }
                    
                } 
            }

            await update(postId,date_due_to,start_date,s_days,e_days,false);
        
            var postlist = await postService.getPosts(group_id, false, 'task');
            
            // Send status 200 response
            return res.status(200).json({
                message: 'Task dates updated!',
                posts:postlist
            });
 
        } catch (err) {
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for changing the task due date
     * @param req 
     * @param res 
     * @param next 
     */
    async changeTaskDate(req: Request, res: Response, next: NextFunction) {

        // Fetch Data from request
        const { params: { postId }, body: { newDate, date_field } } = req;

        // Call Service function to change the assignee
        const post = await postService.changeTaskDate(postId, date_field, newDate)
            .catch((err) => {
                return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
            })

        // Send status 200 response
        return res.status(200).json({
            message: 'Task date updated!',
            post: post
        });
    }

    /**
     * This function is responsible for changing the task status
     * @param req 
     * @param res 
     * @param next 
     */
    async changeTaskStatus(req: Request, res: Response, next: NextFunction) {

        // Fetch Data from request
        const { params: { postId }, body: { status, userId, groupId, isShuttleTasksModuleAvailable } } = req;

        // Call Service function to change the assignee
        await this.callChangeTaskStatusService(postId, status, userId, groupId, isShuttleTasksModuleAvailable)
            .catch((err) => {
                return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
            });

        // Send status 200 response
        return res.status(200).json({
            message: 'Task status updated!'
        });
    }

    async callChangeTaskStatusService(postId: string, status: string, userId: string, groupId: string, isShuttleTasksModuleAvailable: boolean) {

        // Call Service function to change the assignee
        let post = await postService.changeTaskStatus(postId, status, userId)
            .catch((err) => {
                throw err;
            });
        post.task.status = status;

        
        // Execute Automation Flows
        post = await this.executeAutomationFlows(groupId, post, userId, false, isShuttleTasksModuleAvailable);
        

        return post;
    }

    /**
     * This function is responsible for changing the task column
     * @param req 
     * @param res 
     * @param next 
     */
    async changeTaskColumn(req: Request, res: Response, next: NextFunction) {

        // Fetch Data from request
        const { params: { postId }, body: { columnId, userId, groupId, isShuttleTasksModuleAvailable } } = req;

        if (!postId || !columnId || !userId) {
            return sendErr(res, new Error('Please provide the post, title and user as parameters'), 'Please provide the post, title and user as paramaters!', 400);
        }

        const post = this.changeTaskSection(postId, columnId, userId, groupId, isShuttleTasksModuleAvailable)
            .catch((err) => {
                return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
            });

        // Send status 200 response
        return res.status(200).json({
            message: 'Task column updated!',
            post: post
        });
    }

    async changeTaskSection(postId: string, columnId: string, userId: string, groupId: string, isShuttleTasksModuleAvailable: boolean) {
        // Call Service function to change the assignee
        let post = await postService.changeTaskColumn(postId, columnId, userId);

        // Execute Automation Flows
        post = await this.executeAutomationFlows(groupId, post, userId, false, isShuttleTasksModuleAvailable);

        post.task._column = columnId;

        return post;
    }

    /**
     * This function is responsible for fetching the tags
     * @param req 
     * @param res 
     * @param next 
     */
    async getTags(req: Request, res: Response, next: NextFunction) {

        // Fetch Data from request
        const { groupId, tag } = req.query;

        // Call Service function to fetch the tags
        const tags = await tagsService.getTagsSearchResults(groupId, tag)
            .catch((err) => {
                return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
            })

        // // Send status 200 response
        return res.status(200).json({
            message: 'Tags list fetched!',
            tags: tags
        });
    }

    async getRecentActivity(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch data from request
            const userId = req['userId'];

            // Call service function to get recent activity
            const posts = await postService.getRecentActivity(userId);

            // Send status 200 response
            return res.status(200).json({
                message: 'Successfully Retrieved Posts!',
                posts: posts
            });
        } catch (error) {
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }


    async getNextRecentActivity(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch data from request
            const userId = req['userId'];
            const { lastPostId } = req.params;

            // Call service function to get next recent activity
            const posts: any = await postService.getNextRecentActivity(userId, lastPostId);

            // Send status 200 response
            return res.status(200).json({
                message: `Successfully Retrieved Next ${posts.length} Posts!`,
                posts: posts
            });
        } catch (error) {
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }


    async getRecentGroups(req: Request, res: Response, next: NextFunction) {
        try {
            // Fetch data from request
            const userId = req['userId'];

            // Call service function to get recent groups
            const groupSet = await postService.getRecentGroups(userId);

            // Send status 200 response
            return res.status(200).json({
                message: `Successfully Retrieved Groups List`,
                groups: groupSet
            });
        } catch (error) {
            return sendErr(res, new Error(error), 'Internal Server Error!', 500);
        }
    }

    async saveCustomField(req: Request, res: Response, next: NextFunction) {

        const userId = req['userId'];

        // Fetch the groupId
        const { postId } = req.params;

        // Fetch the newCustomField from fileHandler middleware
        const customFieldValue = req.body['customFieldValue'];
        const customFieldName = req.body['customFieldName'];
        const groupId = req.body['groupId'];
        const isShuttleTasksModuleAvailable = req.body['isShuttleTasksModuleAvailable'];

        const post = await this.callChangeCustomFieldValueService(groupId, postId, customFieldName, customFieldValue, userId, isShuttleTasksModuleAvailable)
            .catch((err) => {
                return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
            });

        // Send status 200 response
        return res.status(200).json({
            message: 'Custom Field updated!',
            post: post
        });
    }

    async callChangeCustomFieldValueService(groupId: string, postId: string, cfName: string, cfValue: string, userId: string, isShuttleTasksModuleAvailable: boolean) {
        let post = await postService.changeCustomFieldValue(postId, cfName, cfValue);

        post.task.custom_fields[cfName] = cfValue;

        // Execute Automation Flows
        post = await this.executeAutomationFlows(groupId, post, userId, false, isShuttleTasksModuleAvailable);

        return post;
    }

    /**
     * This function is responsible for fetching the posts of a workspace
     * @param req 
     * @param res 
     * @param next 
     */
    async getWorspacePosts(req: Request, res: Response, next: NextFunction) {

        // Fetch Data from request
        const { workspaceId, type, numDays, overdue, isNorthStar, filteringGroups } = req.query;

        // Call Service function to fetch the posts
        let posts: any = [];

        if (isNorthStar) {
            posts = await postService.getWorspaceNorthStars(workspaceId, type, +numDays, (overdue == "true"), (isNorthStar == "true"), filteringGroups)
                .catch((err) => {
                    return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
                })
        } else {
            posts = await postService.getWorspacePostsResults(workspaceId, type, +numDays, (overdue == "true"), (isNorthStar == "true"), filteringGroups)
                .catch((err) => {
                    return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
                })
        }
        // // Send status 200 response
        return res.status(200).json({
            message: 'Posts fetched!',
            posts: posts
        });
    }

    /**
     * This function is responsible for fetching the posts of a group
     * @param req 
     * @param res 
     * @param next 
     */
    async getGroupPosts(req: Request, res: Response, next: NextFunction) {

        // Fetch Data from request
        const { groupId, type, numDays, overdue } = req.query;

        // Call Service function to fetch the posts
        let posts: any = [];

        if (type === 'task') {
            posts = await postService.getGroupTasksResults(groupId, type, numDays, (overdue == "true"))
                .catch((err) => {
                    return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
                });
        } else {
            posts = await postService.getGroupPostsResults(groupId, numDays)
                .catch((err) => {
                    return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
                });
        }

        // // Send status 200 response
        return res.status(200).json({
            message: 'Posts fetched!',
            posts: posts
        });
    }

    /**
     * This function is responsible for fetching the posts of a column
     * @param req 
     * @param res 
     * @param next 
     */
    async getColumnPosts(req: Request, res: Response, next: NextFunction) {

        // Fetch Data from request
        const { columnId, overdue } = req.query;

        // Call Service function to fetch the posts
        let posts: any = [];

        posts = await postService.getColumnTasksResults(columnId, (overdue == "true"))
            .catch((err) => {
                return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
            });

        // Send status 200 response
        return res.status(200).json({
            message: 'Posts fetched!',
            posts: posts
        });
    }

    /**
     * This function is responsible for fetching the posts of a group
     * @param req 
     * @param res 
     * @param next 
     */
    async getAllGroupTasks(req: Request, res: Response, next: NextFunction) {

        // Fetch Data from request
        const { groupId, period } = req.query;

        // Call Service function to fetch the posts
        const posts = await postService.getAllGroupTasks(groupId, period)
            .catch((err) => {
                return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
            });
        
        // // Send status 200 response
        return res.status(200).json({
            message: 'Group Tasks fetched!',
            posts: posts
        });
    }

    /**
     * This function is responsible for fetching the tasks of a project group
     * @param req 
     * @param res 
     * @param next 
     */
    async getAllProjectTasks(req: Request, res: Response, next: NextFunction) {

        // Fetch Data from request
        const { groupId, overdue } = req.query;

        // Call Service function to fetch the posts
        const posts = await postService.getAllProjectTasks(groupId, (overdue == 'true'))
            .catch((err) => {
                return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
            });
        
        // // Send status 200 response
        return res.status(200).json({
            message: 'Group Tasks fetched!',
            posts: posts
        });
    }
    
    /**
     * This function is responsible for fetching the subtasks of a task
     * @param req 
     * @param res 
     * @param next 
     */
    async getSubtasks(req: Request, res: Response, next: NextFunction) {

        // Fetch Data from request
        const { parentId } = req.query;

        // Call Service function to fetch the posts
        let subtasks: any = [];

        subtasks = await postService.getSubtasks(parentId.toString())
            .catch((err) => {
                return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
            });

        // // Send status 200 response
        return res.status(200).json({
            message: 'Subtasks fetched!',
            subtasks: subtasks
        });
    }

    /**
     * This function is responsible for fetching the number of subtasks of a task
     * @param req 
     * @param res 
     * @param next 
     */
    async getSubtasksCount(req: Request, res: Response, next: NextFunction) {

        // Fetch Data from request
        const { parentId } = req.query;

        try {

            // Call Service function to fetch the posts
            let subtasksCount: number = 0;

            subtasksCount = await postService.getSubtasksCount(parentId.toString());

            // // Send status 200 response
            return res.status(200).json({
                message: 'Subtasks fetched!',
                subtasksCount: subtasksCount
            });
        } catch (err) {
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for moving the posts of a group
     * @param req 
     * @param res 
     * @param next 
     */
    async moveToGroup(req: Request, res: Response, next: NextFunction) {

        // Post Object From request
        const { body: { groupId, oldGroupId, userId, columnId }, params: { postId } } = req;

        // Call service function to edit
        const updatedPost = await postService.moveToGroup(postId, groupId, columnId, oldGroupId, userId)
            .catch((err) => {
                if (err == null) {
                    return sendErr(res, null, 'User not allowed to edit this post!', 403);
                }
                return sendErr(res, new Error(err), 'Insufficient Data, please check into error stack!', 400);
            })

        // Send Status 200 response
        return res.status(200).json({
            message: 'Post Moved Successfully!',
            post: updatedPost
        });
    }

    /**
     * This function is responsible for copying the posts of a group
     * @param req 
     * @param res 
     * @param next 
     */
    async copyToGroup(req: Request, res: Response, next: NextFunction) {

        // Post Object From request
        const { postId, groupId, columnId, oldGroupId, userId } = req.body;

        // Call servide function for adding the post
        const postData = await postService.copyToGroup(postId, groupId, columnId, oldGroupId, userId)
            .catch((err) => {
                return sendErr(res, new Error(err), 'Insufficient Data, please check into error stack!', 400);
            })

        // Send Status 200 response
        return res.status(200).json({
            message: 'Post Copied Successfully!',
            post: postData
        });
    }

    /**
     * This function fetches the 10 possible parent tasks
     * @param { query: { groupId, currentPostId, query } } req 
     * @param res 
     * @param next 
     */
    async searchPossibleParents(req: Request, res: Response, next: NextFunction) {

        // Fetch groupId and lastPostId from request
        var { groupId, query, field } = req.query;
        var { currentPostId } = req.params

        // If groupId or currentPostId are not present, then return error
        if (!groupId || !currentPostId) {
            return sendErr(res, new Error('Please provide the group and the current post as the query parameter'), 'Please provide the groupId as the query paramater!', 400);
        }

        // Fetch the 10 possible posts
        await postService.searchPossibleParents(groupId, currentPostId, query, field)
            .then((posts) => {
                return res.status(200).json({
                    message: `The ${posts.length} possible parent tasks!`,
                    posts: posts
                });
            })
            .catch((err) => {

                return sendErr(res, new Error(err), 'Unable to fetch the tasks, kindly check the stack trace for error', 400)
            });
    }

    /**
     * This function is responsible for setting the parent task of a task
     * @param req 
     * @param res 
     * @param next 
     */
    async setParentTask(req: Request, res: Response, next: NextFunction) {

        // Post Object From request
        const { body: { parentTaskId }, params: { postId } } = req;

        // Call service function to edit
        const updatedPost = await postService.setParentTask(postId, parentTaskId)
            .catch((err) => {
                if (err == null) {
                    sendErr(res, null, 'User not allowed to edit this post!', 403);
                }
                return sendErr(res, new Error(err), 'Insufficient Data, please check into error stack!', 400);
            })

        // Send Status 200 response
        return res.status(200).json({
            message: 'Post assigned to a parent Successfully!',
            post: updatedPost
        });
    }
    
    /**
     * This function is responsible for setting the parent task of a task
     * @param req 
     * @param res 
     * @param next 
     */
    async setDependencyTask(req: Request, res: Response, next: NextFunction) {

        // Post Object From request
        const { body: { dependencyTaskId }, params: { postId } } = req;

        // Call service function to edit
        const updatedPost = await postService.setDependencyTask(postId, dependencyTaskId)
            .catch((err) => {
                if (err == null) {
                    sendErr(res, null, 'User not allowed to edit this post!', 403);
                }
                return sendErr(res, new Error(err), 'Insufficient Data, please check into error stack!', 400);
            })

        // Send Status 200 response
        return res.status(200).json({
            message: 'Post assigned to a parent Successfully!',
            post: updatedPost
        });
    }

    /**
     * This function is responsible for removeing the dependency task of a task
     * @param req 
     * @param res 
     * @param next 
     */
    async removeDependencyTask(req: Request, res: Response, next: NextFunction) {

        // Post Object From request
        const { body: { dependencyTaskId }, params: { postId } } = req;

        // Call service function to edit
        const updatedPost = await postService.removeDependencyTask(postId, dependencyTaskId)
            .catch((err) => {
                if (err == null) {
                    return sendErr(res, null, 'User not allowed to edit this post!', 403);
                }
                return sendErr(res, new Error(err), 'Insufficient Data, please check into error stack!', 400);
            })

        // Send Status 200 response
        return res.status(200).json({
            message: 'Dependency removed Successfully!',
            post: updatedPost
        });
    }

    /**
     * This function runs the automator flows
     * 
     * @param groupId 
     * @param post 
     * @param userId 
     * @param isCreationTaskTrigger 
     */
    async executeAutomationFlows(groupId: string, post: any, userId: string, isCreationTaskTrigger: boolean, isShuttleTasksModuleAvailable: boolean) {
        try {
            const flows = await flowService.getAutomationFlows(groupId);
            if (flows && flows.length > 0) {
                let doTrigger = true;
                await flows.forEach(flow => {
                    const steps = flow['steps'];

                    if (steps && steps.length > 0) {
                        steps.forEach(async step => {
                            const childStatusTriggerIndex = step.trigger.findIndex(trigger => { return trigger.name.toLowerCase() == 'subtasks status'; });
                            const isChildStatusTrigger = (childStatusTriggerIndex >= 0)
                                ? await this.isChildTasksUpdated(step.trigger[childStatusTriggerIndex], post.task._parent_task._id || post.task._parent_task)
                                : false;
                            doTrigger = await this.doesTriggersMatch(step.trigger, post, groupId, isCreationTaskTrigger, isChildStatusTrigger);
                            const shuttleActionIndex = step.action.findIndex(action => action.name == 'Shuttle task');
                            doTrigger = doTrigger && ((shuttleActionIndex < 0) || isShuttleTasksModuleAvailable);
                            if (doTrigger) {
                                post = await postService.executeActionFlow(step.action, post, userId, groupId, isChildStatusTrigger);
                            }
                        });
                    } else {
                        doTrigger = false;
                    }
                });
            }
            return post;
        } catch (error) {
            console.log(`\n⛔️ Error:\n ${error}`);
            throw error;
        }
    }

    /**
     * This method is used to check if the task match the automator triggers
     * 
     * @param triggers
     * @param post
     * @param groupId
     * @param isCreationTaskTrigger
     * @param isChildStatusTrigger
     */
    doesTriggersMatch(triggers: any[], post: any, groupId: string, isCreationTaskTrigger: boolean, isChildStatusTrigger: boolean) {
        let retValue = true;
        const shuttleIndex = post?.task?.shuttles?.findIndex(shuttle => (shuttle?._shuttle_group?._id || shuttle?._shuttle_group) == groupId);
        if (triggers && triggers.length > 0) {
            triggers.forEach(async trigger => {
                if (retValue) {
                    switch (trigger.name) {
                        case 'Assigned to':
                            if (post.task._parent_task) {
                                retValue = false;
                            } else {
                                const usersMatch =
                                    trigger._user.filter((triggerUser) => {
                                        return post._assigned_to.findIndex(assignee => {
                                            return assignee._id.toString() == triggerUser._id.toString()
                                        }) != -1
                                    });
                                retValue = (usersMatch && usersMatch.length > 0);
                            }
                            break;
                        case 'Custom Field':
                            if (post.task._parent_task) {
                                retValue = false;
                            } else {
                                retValue = post.task.custom_fields[trigger.custom_field.name].toString() == trigger.custom_field.value.toString();
                            }
                            break;
                        case 'Section is':
                            if (post.task._parent_task) {
                                if (post?.task?.shuttle_type && (post?.task?._shuttle_group?._id || post?.task?._shuttle_group) == groupId){
                                    const triggerSection = (trigger._section._id || trigger._section);
                                    const postSection = (post.task._shuttle_section._id || post.task._shuttle_section);
                                    retValue = triggerSection.toString() == postSection.toString();
                                } else {
                                    retValue = false;
                                }
                            } else {
                                const triggerSection = (trigger._section._id || trigger._section);
                                let postSection;
                                if (post?.task?.shuttle_type && shuttleIndex >= 0) {
                                    postSection = (post.task.shuttles[shuttleIndex]._shuttle_section._id || post.task.shuttles[shuttleIndex]._shuttle_section);
                                } else {
                                    postSection = (post.task._column._id || post.task._column);
                                }
                                retValue = triggerSection.toString() == postSection.toString();
                            }
                            break;
                        case 'Status is':
                            if (post.task._parent_task) {
                                if (post?.task?.shuttle_type && shuttleIndex >= 0) {
                                    retValue = trigger.status.toUpperCase() == post.task.shuttles[shuttleIndex].shuttle_status.toUpperCase();
                                } else {
                                    retValue = false;
                                }
                            } else {
                                if (post?.task?.shuttle_type && shuttleIndex >= 0) {
                                    retValue = trigger.status.toUpperCase() == post.task.shuttles[shuttleIndex].shuttle_status.toUpperCase();
                                } else {
                                    retValue = trigger.status.toUpperCase() == post.task.status.toUpperCase();
                                }
                            }
                            break;
                        case 'Subtasks Status':
                            retValue = isChildStatusTrigger;
                            break;
                        case 'Task is CREATED':
                            if (!post.task._parent_task && isCreationTaskTrigger) {
                                retValue = true;
                            }
                            break;
                        case 'Approval Flow is Completed':
                            if (post.approval_active && post.approval_flow_launched) {
                                retValue = await this.isApprovalFlowCompleted(post.approval_flow);
                            } else {
                                retValue = false;
                            }
                            break;
                        default:
                            retValue = true;
                            break;
                    }
                }
            });
        } else {
          retValue = false;
        }
        return retValue;
    }

    isApprovalFlowCompleted(flow) {
        for (let i = 0; i < flow.length; i++) {
            if (!flow[i].confirmed || !flow[i].confirmation_date) {
                return false;
            }
        }
        return true
    }

    /**
     * This method is used to check if the child tasks has been updated.
     * In case one of the triggers is to check the status of all subtasks
     * 
     * @param trigger 
     * @param parentTaskId 
     */
    async isChildTasksUpdated(trigger: any, parentTaskId: string) {
      let retValue = true;
        if (trigger && parentTaskId) {
            let subtasks = await postService.getSubtasks(parentTaskId);
            subtasks.forEach(subtask => {
                if (retValue) {
                    retValue = trigger.subtaskStatus.toUpperCase() == subtask.task.status.toUpperCase();
                }
            });
        } else {
          retValue = false;
        }
        return retValue;
    }

    /**
     * This function is responsible for cloning the posts of a assignee
     * @param req 
     * @param res 
     * @param next 
     */
    async cloneToAssignee(req: Request, res: Response, next: NextFunction) {

        // Post Object From request
        const { postId, assignees } = req.body;

        // Call servide function for adding the post
        assignees.forEach(async assigneeId => {
            const postData = await postService.cloneToAssignee(postId, assigneeId)
                .catch((err) => {
                    return sendErr(res, new Error(err), 'Insufficient Data, please check into error stack!', 400);
                });
        });

        // Send Status 200 response
        return res.status(200).json({
            message: 'Post Clonned Successfully!',
        });
    }

    /**
     * This function fetches the list of templates present inside a group
     * @param { query: { groupId } } req
     * @param res 
     * @param next 
     */
    async getGroupTemplates(req: Request, res: Response, next: NextFunction) {

        // Fetch groupId and lastPostId from request
        var { groupId } = req.query;

        // If groupId is not present, then return error
        if (!groupId) {
            return sendErr(res, new Error('Please provide the groupId as the query parameter'), 'Please provide the groupId as the query paramater!', 400);
        }

        await postService.getGroupTemplates(groupId)
            .then((posts) => {
                return res.status(200).json({
                    message: `The group templates!`,
                    posts: posts
                });
            })
            .catch((err) => {

                // If there's an error send bad request
                return sendErr(res, new Error(err), 'Unable to fetch the templates, kindly check the stack trace for error', 400)
            });
    }

    /**
     * This function is responsible for creating a template from a posts
     * @param req 
     * @param res 
     * @param next 
     */
    async createTemplate(req: Request, res: Response, next: NextFunction) {

        // Post Object From request
        const { postId, groupId, templateName } = req.body;

        // Call servide function for creating the template
        const postData = await postService.createTemplate(postId, groupId, templateName)
            .catch((err) => {
                return sendErr(res, new Error(err), 'Insufficient Data, please check into error stack!', 400);
            })

        // Send Status 200 response
        return res.status(200).json({
            message: 'Template Created Successfully!',
            post: postData
        });
    }

    /**
     * This function is responsible for overwriting a template
     * @param req 
     * @param res 
     * @param next 
     */
    async overwriteTemplate(req: Request, res: Response, next: NextFunction) {

        // Post Object From request
        const { body: { templateName, templateId }, params: { postId } } = req;

        // Call service function to edit
        const updatedPost = await postService.overwriteTemplate(postId, templateId, templateName)
            .catch((err) => {
                if (err == null) {
                    sendErr(res, null, 'User not allowed to edit this post!', 403);
                }
                return sendErr(res, new Error(err), 'Insufficient Data, please check into error stack!', 400);
            })

        // Send Status 200 response
        return res.status(200).json({
            message: 'Template Overwritten Successfully!',
            post: updatedPost
        });
    }

    /**
     * This function is responsible for creating a template from a posts
     * @param req 
     * @param res 
     * @param next 
     */
    async createTaskFromTemplate(req: Request, res: Response, next: NextFunction) {

        // Post Object From request
        const { templatePostId, postId } = req.body;

        // Call servide function for creating the template
        const postData = await postService.createTaskFromTemplate(templatePostId, postId)
            .catch((err) => {
                return sendErr(res, new Error(err), 'Insufficient Data, please check into error stack!', 400);
            })

        // Send Status 200 response
        return res.status(200).json({
            message: 'Task Created Successfully!',
            post: postData
        });
    }

    /**
     * This function is responsible for changing the task allocation
     * @param req 
     * @param res 
     * @param next 
     */
    async saveAllocation(req: Request, res: Response, next: NextFunction) {

        // Fetch Data from request
        const { params: { postId }, body: { allocation } } = req;

        // Call Service function to change the assignee
        const post = await postService.saveAllocation(postId, +allocation)
            .catch((err) => {
                return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
            })

        // Send status 200 response
        return res.status(200).json({
            message: 'Task allocation updated!',
            post: post
        });
    }

    async pinToTop(req: Request, res: Response, next: NextFunction) {

        // Fetch Data from request
        const { params: { postId }, body: { pin } } = req;

        // Call Service function to change the assignee
        const post = await postService.pinToTop(postId, pin)
            .catch((err) => {
                return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
            })

        // Send status 200 response
        return res.status(200).json({
            message: 'Post pinned/unpinned!',
            post: post
        });
    }

    async voteIdea(req: Request, res: Response, next: NextFunction) {

        // Fetch Data from request
        const { params: { postId }, body: { vote } } = req;
        const userId = req['userId'];

        // Call Service function to change the assignee
        const post = await postService.voteIdea(postId, vote, userId)
            .catch((err) => {
                return sendErr(res, new Error(err), 'Bad Request, please check into error stack!', 400);
            })

        // Send status 200 response
        return res.status(200).json({
            message: 'Idea Voted!',
            post: post
        });
    }

    async selectShuttleGroup(req: Request, res: Response, next: NextFunction) {
        // Fetch the groupId
        const { postId } = req.params;

        // Fetch the value from fileHandler middleware
        const shuttleGroupId = req.body['shuttleGroupId'];

        try {
            const post = await postService.selectShuttleGroup(postId, shuttleGroupId);

            // Send status 200 response
            return res.status(200).json({
                message: 'Task updated!',
                post: post
            });
        } catch (err) {
            return sendErr(res, err, 'Internal Server Error!', 500);
        }
    };

    async selectShuttleSection(req: Request, res: Response, next: NextFunction) {
        // Fetch the postId
        const { postId } = req.params;

        // Fetch userId from the request
        const userId = req['userId'];

        // Fetch the value for shuttleSectionId & groupId
        const shuttleSectionId = req.body['shuttleSectionId'];
        const groupId = req.body['groupId'];
        const isShuttleTasksModuleAvailable = req.body['isShuttleTasksModuleAvailable'];

        try {
            // Find the group and update
            let post = await postService.selectShuttleSection(postId, true, shuttleSectionId, groupId);
           
            // Execute Automation Flows
            post = await this.executeAutomationFlows(groupId, post, userId, true, isShuttleTasksModuleAvailable);

            // Send status 200 response
            return res.status(200).json({
                message: 'Task updated!',
                post: post
            });
        } catch (err) {
            return sendErr(res, err, 'Internal Server Error!', 500);
        }
    };

    async selectShuttleStatus(req: Request, res: Response, next: NextFunction) {
        // Fetch the postId & groupId
        const { postId } = req.params;

        // Fetch userId from the request
        const userId = req['userId'];

        // Fetch the value for shuttleSectionId & groupId
        const shuttleStatus = req.body['shuttleStatus'];
        const groupId = req.body['groupId'];
        const isShuttleTasksModuleAvailable = req.body['isShuttleTasksModuleAvailable'];

        try {
            // Find the group and update
            let post = await postService.selectShuttleStatus(postId, groupId, shuttleStatus, userId);
            
            // Execute Automation Flows
            post = await this.executeAutomationFlows(groupId, post, userId, false, isShuttleTasksModuleAvailable);

            // Send status 200 response
            return res.status(200).json({
                message: 'Task updated!',
                post: post
            });
        } catch (err) {
            return sendErr(res, err, 'Internal Server Error!', 500);
        }
    };

    async runAutomator(req: Request, res: Response, next: NextFunction) {
        // Fetch the postId & groupId
        const { postId } = req.params;

        // Fetch userId and isShuttleTasksModuleAvailable
        const { userId, isShuttleTasksModuleAvailable } = req.body;

        try {
            let post = await Post.findOne({
                    _id: postId
                })
                .populate({ path: '_group', select: 'group_name group_avatar workspace_name' })
                .populate({ path: '_assigned_to', select: 'first_name last_name profile_pic role email' })
                .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
                .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
                .populate({ path: 'task._parent_task', select: '_id title _assigned_to' })
                .populate({ path: 'task.shuttles._shuttle_group', select: '_id group_name group_avatar shuttle_type _shuttle_section' })
                .populate({ path: 'task.shuttles._shuttle_section', select: '_id title' })
                .lean();;

            // Execute Automation Flows
            post = await this.executeAutomationFlows(post._group, post, userId, false, isShuttleTasksModuleAvailable);

            // Send status 200 response
            return res.status(200).json({
                message: 'Task updated!',
                post: post
            });
        } catch (err) {
            return sendErr(res, err, 'Internal Server Error!', 500);
        }
    };
}