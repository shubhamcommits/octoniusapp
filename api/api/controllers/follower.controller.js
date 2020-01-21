const {followerService} = require('./../services/index');


class FollowerController {

    async getFollowersForTask(req, res) {
        return await followerService.getAllFollowers(req.params.taskId, res);
    }

    async addToTask(req, res) {
        return await followerService.addToTask(req.body.taskId, req.body.userId, res);
    }

    async remove(req, res) {
        return await followerService.remove(req.params.taskId, req.params.userId, res);
    }
}

module.exports = new FollowerController();
