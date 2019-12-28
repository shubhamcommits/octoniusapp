const moment = require('moment');

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
        await Post.findOneAndUpdate({ _id: postId }, {
                                            'task.completed_at' : moment(),
                                            'task._assigned_to': followerId,
                                            'task.unassigned': 'No',
                                            'task.status': 'to do'
                                        });
        await postService.removeFollower(postId, followerId);
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
