const moment = require('moment');

const notifications = require('../controllers/notifications.controller');

const { sendMail } = require('../../utils');

const Follower = require('../models/follower.model');
const Post = require('../models/post.model');

const postUtil = {
    async getFollowers(taskId) {
        return await Follower.find({taskId});
    },

    async getNextFollowerForTask(taskId) {
        console.log(await postUtil.getFollowers(taskId));
        return (await postUtil.getFollowers(taskId))[0];
    },

    async completeTaskWithFollowers(postId, followerId) {
       const postUpdated = await Post.findOneAndUpdate({ _id: postId }, {
                                            'task.completed_at' : moment(),
                                            'task._assigned_to': followerId,
                                            'task.unassigned': 'No',
                                            'task.status': 'to do'
                                        })      .populate('task._assigned_to', 'first_name last_name profile_pic')
            .populate('_group', '_id group_name')
            .populate('_posted_by', 'first_name last_name profile_pic');

        await postService.removeFollower(postId, followerId);

        await notifications.newTaskReassignment(postUpdated);
        await sendMail.taskReassigned(postUpdated);
    },

    async completeTaskWithNoFollowers(postId) {
        await Post.findOneAndUpdate({ _id: postId }, { 'task.completed_at' : moment()});
    }
};

const postService = {

    async completeTask(postId) {
        const follower = await postUtil.getNextFollowerForTask(postId);
        const followerId = follower ? follower.userId : null;
        if(followerId) {
            await postUtil.completeTaskWithFollowers(postId, followerId)
        } else {
            await postUtil.completeTaskWithNoFollowers(postId);
        }
    },

    async removeFollower(taskId, userId) {
      await Follower.deleteOne({
          taskId: taskId,
          userId: userId
      });
    }
};

module.exports = postService;
