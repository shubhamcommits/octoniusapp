const followerService = require('./../services/index');


class FollowerController {

    async getFollowersForTask(req, res) {
        return await followerService.getAllFollowers();
    }

    async addToTask(req, res) {
        return await followerService.addToTask(req.params.taskId, req.body.userId);
    }
}

module.exports = new FollowerController();
