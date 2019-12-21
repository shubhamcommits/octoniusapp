const follower = require('./../models/follower.model');
const user = require('./../models/user.model');

const followerService = {
    async getAllFollowers(taskId, res) {
        try {
            const followers = await follower.find({taskId: taskId});
            return res.status(200).json(await user.find({ "_id": {$in: followers.map(f => f.userId)}}));
        } catch (e) {
            console.log(e);
            return res.status(500).json({
                message: 'Failed to retrieve all followers'
            });
        };
    },

    async addToTask(taskId, userId, res) {
        try {
            return res.status(200).json(await follower.create({
                taskId,
                userId
            }));
        } catch (e) {
            return res.status(500).json({
                message: 'Failed to save follower'
            });
        }
    }
};

module.exports = followerService;
