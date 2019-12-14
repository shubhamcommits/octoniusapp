const follower = require('./../models/follower.model');

class FollowerService {
    async getAllFollowers(taskId) {
        return follower.find({
            taskId: taskId
        });

    }

    async addToTask(taskId, userId) {
        return await follower.save({
            taskId,
            userId
        });
    }
}


module.exports = new FollowerService();
