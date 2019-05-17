

const { User, Post, Group } = require('../../api/models');

const { sendErr } = require('../../utils');


const createPostQuery = (userGroups, query) => Post.find({
  $and: [
    { _group: { $in: userGroups } },
    {
      $or: [
        { content: { $regex: query, $options: 'i' } },
        { title: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }
      ]
    }
  ]
}).sort({ created_date: -1 })
  .populate('_posted_by', 'full_name first_name last_name profile_pic')
  .populate('_group', 'group_name');

const createUserQuery = (user, query) => User.find({
  $and: [
    { full_name: { $regex: query, $options: 'i' } },
    { _workspace: user._workspace || user._workspace._id }
  ]
}).select('profile_pic full_name first_name last_name email created_date skills');

const createSkillsQuery = (user, query) => User.find({
  $and: [
    { skills: { $regex: query, $options: 'i' } },
    { _workspace: user._workspace },
    { active: true }
  ]
}).select('profile_pic full_name first_name last_name email created_date skills');


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
        skillsQuery = createSkillsQuery(user, req.params.query);
        userQuery = createUserQuery(user, req.params.query);

        const allPosts = await postQuery.limit(3).exec();
        const allUsers = await userQuery.limit(3).exec();
        const allSkills = await skillsQuery.limit(3).exec();
        
        
        let morePostsLoad = false;
        let moreSkillsLoad = false;
        let moreUsersLoad = false;

        if (allPosts.length === 3) {
          allPosts.pop();
          morePostsLoad = true;
        }

        if (allUsers.length === 3) {
          allUsers.pop();
          moreUsersLoad = true;
        }

        if (allSkills.length === 3) {
          allSkills.pop();
          moreSkillsLoad = true;
        }

        const result = {
          posts: allPosts,
          loadMorePosts: morePostsLoad,
          users: allUsers,
          loadMoreUsers: moreUsersLoad,
          skills: allSkills,
          loadMoreSkills: moreSkillsLoad,

        }

        return { results: result};
    }
  } catch (err) {
    console.log('err', err);
    sendErr(res, err);
  }
};


module.exports = {
  getSearchResults
};
