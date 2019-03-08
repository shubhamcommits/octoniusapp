

const { User, Post, Group } = require('../../api/models');

const { sendErr } = require('../../utils');


const createPostQuery = (userGroups, query) => Post.find({
  $and: [
    { _group: { $in: userGroups } },
    { content: { $regex: query, $options: 'i' } }
  ]
}).sort({ created_date: -1 })
    .populate('_posted_by', 'full_name profile_pic')
  .populate('_group', 'group_name');

const createUserQuery = (user, query) => {
  return User.find({
    $and: [
      { full_name: { $regex: query, $options: 'i' } },
      { _workspace: user._workspace || user._workspace._id }
    ]
  }).select('profile_pic full_name email created_date');
};

const createSkillsQuery = (user, query) => User.find({
  $and: [
    { skills: { $regex: query, $options: 'i' } },
    { _workspace: user._workspace },
    { active: true }
  ]
}).select('profile_pic full_name email created_date');


const getSearchResults = async (req, res, amountLoaded) => {
// Focus on only searching within own workspace
  try {
    let postQuery;
    let userQuery;
    let skillsQuery;
    const user = await User.findOne({ _id: req.userId });

    switch (req.params.filter) {
      case 'posts':
        postQuery = createPostQuery(user._groups, req.params.query);
        let morePostsToLoad = false;
        const posts = await postQuery.skip(parseInt(amountLoaded, 10) || 0).limit(11).exec();
        if (posts.length === 11) {
          posts.pop();
          morePostsToLoad = true;
        }

        return { results: posts, moreToLoad: morePostsToLoad };
      case 'users':
        userQuery = createUserQuery(user, req.params.query);
        let moreUsersToLoad = false;
        const users = await userQuery.skip(parseInt(amountLoaded, 10) || 0).limit(11).exec();
        if (users.length === 11) {
          users.pop();
          moreUsersToLoad = true;
        }

        return { results: users, moreToLoad: moreUsersToLoad };
      case 'skills':
        skillsQuery = createSkillsQuery(user, req.params.query);
        let moreSkillsToLoad = false;
        const skills = await skillsQuery.skip(parseInt(amountLoaded, 10) || 0).limit(11).exec();
        if (skills.length === 11) {
          skills.pop();
          moreSkillsToLoad = true;
        }

        return { results: skills, moreToLoad: moreSkillsToLoad };
      case 'all':
        postQuery = createPostQuery(user._groups, req.params.query);

        const allPosts = await postQuery.limit(6).exec();

        let moreToLoad = false;

        if (allPosts.length === 6) {
          allPosts.pop();
          moreToLoad = true;
        }

        return { results: allPosts, moreToLoad };
    }
  } catch (err) {
    console.log('err', err);
    sendErr(res, err);
  }
};


module.exports = {
  getSearchResults
};
