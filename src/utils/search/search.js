

const { User, Post, Group } = require('../../api/models');

const { sendErr } = require('../../utils');


const createPostQuery = (userGroups, query) => Post.find({
  $and: [
    { _group: { $in: userGroups } },
    { content: { $regex: query, $options: 'i' } }
  ]
}).populate('_posted_by', 'full_name profile_pic')
  .populate('_group', 'group_name');

const createUserQuery = (user, query) => User.find({
  $and: [
    { full_name: { $regex: query, $options: 'i' } },
    { _workspace: user._workspace },
    { active: true }
  ]
}).select('profile_pic full_name email created_date');

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
      console.log('test 0', req.params);
    let postQuery;
    let userQuery;
    let skillsQuery;
    const user = await User.findOne({ _id: req.userId });

    switch (req.params.filter) {
      case 'posts':
        postQuery = createPostQuery(user._groups, req.params.query);
        let morePostsToLoad = false;
        const posts = await postQuery.skip(parseInt(amountLoaded, 10) || 0).limit(16).exec();
        if (posts.length === 16) {
          posts.pop();
          morePostsToLoad = true;
        }

        return { results: posts, moreToLoad: morePostsToLoad };
      case 'users':
        userQuery = createUserQuery(user, req.params.query);
        let moreUsersToLoad = false;
        const users = await userQuery.skip(parseInt(amountLoaded, 10) || 0).limit(15).exec();
        if (users.length === 16) {
          users.pop();
          moreUsersToLoad = true;
        }

        return { results: users, moreToLoad: moreUsersToLoad };
      case 'skills':
        skillsQuery = createSkillsQuery(user, req.params.query);
        let moreSkillsToLoad = false;
        const skills = await skillsQuery.skip(parseInt(amountLoaded, 10) || 0).limit(15).exec();
        if (skills.length === 16) {
          users.pop();
          moreSkillsToLoad = true;
        }

        return { results: users, moreToLoad: moreSkillsToLoad };
      case 'all':
        postQuery = createPostQuery(user._groups, req.params.query);
        userQuery = createUserQuery(user, req.params.query);
        skillsQuery = createSkillsQuery(user, req.params.query);

        const results = await Promise.all([
          userQuery.limit(6).exec(),
          postQuery.limit(6).exec(),
          skillsQuery.limit(6).exec()
        ]);

        console.log('test 1', results);
        const moreToLoad = [false, false, false];

        results.forEach((result, index) => {
          if (result.length === 6) {
            results[index].pop();
            moreToLoad[index] = true;
          }
        });

          console.log('test 2', results);

        return { results, moreToLoad };
    }
  } catch (err) {
    console.log('err', err);
    sendErr(res, err);
  }
};


module.exports = {
  getSearchResults
};
