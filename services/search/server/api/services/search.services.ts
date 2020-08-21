import { Post, User, File } from '../models';
import { sendErr } from '../utils/sendError';

/*  ===============================
 *  -- SEARCH Service --
 *  ===============================
 */

export class SearchService {

  async getSearchResults(req, res, amountLoaded) {
    // Focus on only searching within own workspace
    try {
      let postQuery;
      let userQuery;
      let skillsQuery;
      let tagsQuery;
      const user = await User.findOne({ _id: req.userId });

      switch (req.params.filter) {
        case 'posts':
          return this.createPostQuery(user['_groups'], req.params.query);
        case 'users':
          return this.createUserQuery(user, req.params.query);
        case 'files':
          return this.createFilesQuery(user['_groups'], req.params.query);
        /*
        case 'skills':
          skillsQuery = this.createSkillsQuery(user, req.params.query);
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
          tagsQuery = this.createTagsQuery(user['_groups'], req.params.query);
          let moreTagsToLoad = false;
          const tags = await tagsQuery.skip(parseInt(amountLoaded, 10) || 0).limit(11).exec();
          if (tags.length === 11) {
            tags.pop();
            moreTagsToLoad = true;
          }

          return { results: tags, moreToLoad: moreTagsToLoad };
        case 'all':
          postQuery = this.createPostQuery(user['_groups'], req.params.query);
          skillsQuery = this.createSkillsQuery(user, req.params.query);
          userQuery = this.createUserQuery(user, req.params.query);
          // tagsQuery = this.createTagsQuery(user['_groups'], req.params.query);

          let allPosts = await postQuery.limit(3).exec();
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
            posts: postQuery,
            // loadMorePosts: morePostsLoad,
            users: userQuery,
            // loadMoreUsers: moreUsersLoad,
            skills: skillsQuery,
            // loadMoreSkills: moreSkillsLoad,
          }

          return { results: result};
        */
      }
    } catch (err) {
      sendErr(res, err);
    }
  };

  async createPostQuery(userGroups, query) {
    return Post.find({
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
    }).sort({ created_date: -1 });
  }

  async createUserQuery(user, query) {
    return User.find({
      $and: [
        { _workspace: user._workspace || user._workspace._id },
        { active: {$eq : true}},
        {
          $or: [
            { first_name: { $regex: query, $options: 'i' } },
            { last_name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
            { skills: { $regex: query, $options: 'i' } },
            { bio: { $regex: query, $options: 'i' } },
            { company_name: { $regex: query, $options: 'i' } },
            { phone_number: { $regex: query, $options: 'i' } },
            { role: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    });
  }

  async createFilesQuery(userGroups, query) {
    return File.find({
      $and: [
        { _group: { $in: userGroups } },
        {
          $or: [
            { original_name: { $regex: query, $options: 'i' } },
            { modified_name: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    }).sort({ created_date: -1 });
  }

  async createSkillsQuery(user, query) {
    return User.find({
      $and: [
        { skills: { $regex: query, $options: 'i' } },
        { _workspace: user._workspace },
        { active: {$eq : true}}
      ]
    }).select('profile_pic full_name first_name last_name email created_date skills');
  }

  async createTagsQuery(userGroups, query) {
    return Post.find({
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
  }

  /*
  async getSkillsSearchResults(req, res, amountLoaded) {
      try {
        const user = await User.findOne({ _id: req.userId });
        var regexConvert = req.params.query.replace(/[#.*+?^${}()|[\]\\]/g, '\\$&')
        let skillsQuery = User.aggregate([{
          $match : {
            skills: { $regex: regexConvert, $options: 'i' }
            }
          },
          { $unwind : "$skills" },
          { $match : {
              skills: { $regex: regexConvert, $options: 'i' }
            }
          },
          {
            $project: {
              skills: '$skills'
            }
          }
        ]);

        let moreSkillsToLoad = false;
        var skills = await skillsQuery.skip(parseInt(amountLoaded, 10) || 0).limit(11).exec();
        if(skills){

          let key = ["skills"],
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

  async getTagsSearchResults (req, res, amountLoaded) {
    try {

      const user = await User.findOne({ _id: req.userId });
      var regexConvert = req.params.query.replace(/[#.*+?^${}()|[\]\\]/g, '\\$&')
      let tagQuery = Post.aggregate([{
        $match : {
          tags: { $regex: regexConvert, $options: 'i' }
        }},
        { $unwind : "$tags" },
        { $match : {
            tags: { $regex: regexConvert, $options: 'i' }
        }
        },
        {
          $project: {
            tags: '$tags'
          }
        }
      ]);

      let moreSkillsToLoad = false;
      var tags = await tagQuery.skip(parseInt(amountLoaded, 10) || 0).limit(11).exec();
      if(tags){

        let key = ["tags"],
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
  */
}
