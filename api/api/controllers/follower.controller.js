const {followerService} = require('./../services/index');


class FollowerController {

    async getFollowersForTask(req, res) {
        console.log(followerService);
        return await followerService.getAllFollowers(req.params.taskId, res);
    }

    async addToTask(req, res) {
        return await followerService.addToTask(req.body.taskId, req.body.userId, res);
    }
}

module.exports = new FollowerController();
