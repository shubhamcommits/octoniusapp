const follower = require('../models/follower.model');
const post = require('../models/post.model');

const postUtil = {
    async getFollowers(taskId) {
        return await follower.find({taskId});
    }
}

const postService = {

    async getAllFollowers(taskId, userId, res) {

    },

    async getNextFollowerForTask(taskId) {
        console.log(await postUtil.getFollowers(taskId));
      return (await postUtil.getFollowers(taskId))[0];
    },

    async removeFollower(taskId, userId) {
      await follower.deleteOne({
          taskId: taskId,
          userId: userId
      });
    }
};

module.exports = postService;
