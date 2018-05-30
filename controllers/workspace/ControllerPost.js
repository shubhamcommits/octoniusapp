const Group = require('../../models/group')
const User = require('../../models/user');
const Workspace = require('../../models/workspace');
const Post = require('../../models/post');

module.exports = {

    addNewNormalPost(req, res, next) {
        let post_data = req.body;

        Post.create(post_data)
            .then((post) => {
                res.status(200).json({
                    message: "post has been added successfully",
                    post: post
                });

            })
            .catch((err) => {
                res.status(500).json({
                    message: "something went wrong | internal server error ",
                    err
                });
            })
    },
    addNewEventPost(req, res, next) {
        console.log("add new calendar post controller");
    },
    addNewTaskPost(req, res, next) {
        console.log("add new event type post");
    },

    getGroupPosts(req, res, next) {
        const group_id = req.params.group_id;

        Post.find({
                _group: group_id
            })
            .sort('-created_date')
            .populate('_posted_by', 'first_name last_name')
            .then((posts) => {

                /* if (posts.length < 1) {
                        res.status(404).json({
                            messag: "post",
                            err
                        })
                } */
                res.status(200).json({
                    message: "posts found successfully!",
                    posts: posts
                });
            })
            .catch((err) => {
                res.status(500).json({
                    message: "something went wrong | internal server error ",
                    err
                });
            })

    }




}