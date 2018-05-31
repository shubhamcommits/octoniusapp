    const Group = require('../../models/group')
    const User = require('../../models/user');
    const Workspace = require('../../models/workspace');
    const Post = require('../../models/post');

    console.log("===========Post Controller===========");

    module.exports = {

        addNewNormalPost(req, res, next) {
            let post_data = req.body;

            Post.create(post_data)
                .then((post) => res.status(200).json({
                    message: "post has been added successfully",
                    post: post
                }))
                .catch((err) => res.status(500).json({
                    message: "something went wrong | internal server error ",
                    err
                }))
        },
        addNewEventPost(req, res, next) {
            console.log("add new calendar post controller");
        },
        addNewTaskPost(req, res, next) {
        console.log("add new event type post");
    },
    addCommentOnPost(req, res, next) {


        let post_id = req.body.post_id;
        let _commented_by = req.body._commented_by;
        let content = req.body.content;

        User.findById({
                _id: _commented_by
            }).then((user) => {
                Post.findByIdAndUpdate({
                        _id: post_id
                    }, {
                        $push: {

                            comments: {
                                content: content,
                                _commented_by: user
                            }
                        },
                        $inc: {
                            comments_count: 1
                        },
                    }, {
                        new: true
                    })
                    .then((post) => {
                        res.status(200).json({
                            message: "comment added on post successfully",
                            post: post
                        });
                    })
                    .catch((err) => {
                        res.status(500).json({
                            message: "something went wrong | internal server error",
                            error: err
                        });
                    })
            })
            .catch((err) => res.status(500).json({
                message: "something went wrong | internal server error",
                error: err
            }))
    },


    getGroupPosts(req, res, next) {
        const group_id = req.params.group_id;

        Post.find({
                _group: group_id
            })
            .sort('-created_date')
            .populate('_posted_by', 'first_name last_name')
            .populate('comments._commented_by', 'first_name last_name')
            .then((posts) => res.status(200).json({
                message: "posts found successfully!",
                posts: posts
            }))
            .catch((err) => res.status(500).json({
                message: "something went wrong | internal server error ",
                err
            }))

    }




}