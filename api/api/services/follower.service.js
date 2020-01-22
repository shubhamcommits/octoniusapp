const follower = require('./../models/follower.model');
const user = require('./../models/user.model');

const followerServiceUtil = {
    async saveFollower(taskId, userId, res) {
        const dbFollower = await follower.findOne({userId: userId, taskId: taskId});
        if (dbFollower) {
            return res.status(400).json({
                message: 'Already a follower'
            });
        }
        return res.status(200).json(await follower.create({
            taskId,
            userId
        }));
    }
};

const followerService = {
    async getAllFollowers(taskId, res) {
        try {
            const followers = await follower.find({taskId: taskId});
            return res.status(200)
                .json(await user.find({"_id": {$in: followers.map(f => f.userId)}})
                    .select('full_name profile_pic'));
        } catch (e) {
            console.log(e);
            return res.status(500).json({
                message: 'Failed to retrieve all followers'
            });
        }
        ;
    },

    async addToTask(taskId, userId, res) {
        try {
            return followerServiceUtil.saveFollower(taskId, userId, res);
        } catch (e) {
            return res.status(500).json({
                message: 'Failed to save follower'
            });
        }
    },

    async remove(taskId, userId, res) {
        try {
            await follower.deleteOne({taskId: taskId, userId: userId});
            return await this.getAllFollowers('5e027cf8223ba2545795e2d4', res);
        } catch (e) {
            return res.status(500).json({
                message: 'Unable to delete follower'
            })
        }
    }
};

module.exports = followerService;
