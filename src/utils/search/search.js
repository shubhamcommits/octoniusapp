

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

const createTagsQuery = (userGroups, query) => Post.find({
  $and: [
    { _group: { $in: userGroups } },
    {
      $or: [
        { tags: { $regex: query, $options: 'i' } }
      ]
    }
  ]
}).sort({ created_date: -1 })
.populate('_posted_by', 'full_name first_name last_name profile_pic')
.populate('_group', 'group_name');

//query showing skills only for auto complete in text input
const createSkillsListQuery = (user, query) => User.aggregate([{
  
  $match : {
    skills: { $regex: query, $options: 'i' }
 }},
 { $unwind : "$skills" },
 { $match : {
    skills: { $regex: query, $options: 'i' }
 }
},
{
  $project: {
    skills: '$skills'
  }
}
]);
//query showing tags only for auto complete in text input
const createTagListQuery = (user, query) => Post.aggregate([{
  
  $match : {
    tags: { $regex: query, $options: 'i' }
 }},
 { $unwind : "$tags" },
 { $match : {
    tags: { $regex: query, $options: 'i' }
 }
},
{
  $project: {
    tags: '$tags'
  }
}
]);

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
        let users = await userQuery.skip(parseInt(amountLoaded, 10) || 0).limit(11).exec();
        if (users.length === 11) {
          users.pop();
          moreUsersToLoad = true;
        }

        // Filter out the current user from the results
        users = users.filter(user => user._id.toString() !== req.userId.toString());

        return { results: users, moreToLoad: moreUsersToLoad };
      case 'skills':
        skillsQuery = createSkillsQuery(user, req.params.query);
        let moreSkillsToLoad = false;
        let skills = await skillsQuery.skip(parseInt(amountLoaded, 10) || 0).limit(11).exec();
        if (skills.length === 11) {
          skills.pop();
          moreSkillsToLoad = true;
        }

        // Filter out the current user from the results
        skills = skills.filter(user => user._id.toString() !== req.userId.toString());

        return { results: skills, moreToLoad: moreSkillsToLoad };
      case 'tags':
        tagsQuery = createTagsQuery(user._groups, req.params.query);
        let moreTagsToLoad = false;
        const tags = await tagsQuery.skip(parseInt(amountLoaded, 10) || 0).limit(11).exec();
        if (tags.length === 11) {
          tags.pop();
          moreTagsToLoad = true;
        }

        return { results: tags, moreToLoad: moreTagsToLoad };
      case 'all':
        postQuery = createPostQuery(user._groups, req.params.query);
        skillsQuery = createSkillsQuery(user, req.params.query);
        userQuery = createUserQuery(user, req.params.query);

        const allPosts = await postQuery.limit(3).exec();
        let allUsers = await userQuery.limit(3).exec();
        let allSkills = await skillsQuery.limit(3).exec();
        
        
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

        // Filter out the current user from the results
        allUsers = allUsers.filter(user => user._id.toString() !== req.userId.toString());
        allSkills = allSkills.filter(user => user._id.toString() !== req.userId.toString());

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

const getSkillsSearchResults = async (req, res, amountLoaded) => {
    try {
  
      const user = await User.findOne({ _id: req.userId });
      var regexConvert = req.params.query.replace(/[#.*+?^${}()|[\]\\]/g, '\\$&')
      skillsQuery = createSkillsListQuery(user, regexConvert);

      let moreSkillsToLoad = false;
      var skills = await skillsQuery.skip(parseInt(amountLoaded, 10) || 0).limit(11).exec();
      if(skills){

        key = ["skills"],
        filtered = skills.filter(
            (s => o => 
                (k => !s.has(k) && s.add(k))
                (key.map(k => o[k]).join('|'))
            )
            (new Set)
        );

        skills = filtered
        if (skills.length === 11) {
          skills.pop();
          moreSkillsToLoad = true;
        }
        return { results: skills, moreToLoad: moreSkillsToLoad };
      }
    } catch (err) {
      console.log('err', err);
      sendErr(res, err);
    }
  };

const getTagsSearchResults = async (req, res, amountLoaded) => {
  try {

    const user = await User.findOne({ _id: req.userId });
    var regexConvert = req.params.query.replace(/[#.*+?^${}()|[\]\\]/g, '\\$&')
    tagQuery = createTagListQuery(user, regexConvert);

    let moreSkillsToLoad = false;
    var tags = await tagQuery.skip(parseInt(amountLoaded, 10) || 0).limit(11).exec();
    if(tags){

      key = ["tags"],
      filtered = tags.filter(
          (s => o => 
              (k => !s.has(k) && s.add(k))
              (key.map(k => o[k]).join('|'))
          )
          (new Set)
      );

      tags = filtered
      if (tags.length === 11) {
        tags.pop();
        moreSkillsToLoad = true;
      }
      return { results: tags, moreToLoad: moreSkillsToLoad };
    }
  } catch (err) {
    console.log('err', err);
    sendErr(res, err);
  }
};
module.exports = {
  getSearchResults,
  getSkillsSearchResults,
  getTagsSearchResults,
};
