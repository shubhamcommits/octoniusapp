import { Post, User, File, Comment } from '../models';
import { sendErr } from '../utils/sendError';

/*  ===============================
 *  -- SEARCH Service --
 *  ===============================
 */

export class SearchService {

  async getSearchResults(req, res) {
    // Focus on only searching within own workspace
    try {
      const user = await User.findOne({ _id: req.userId }).lean();

      let query = req.params.query;

      if (!query || query == undefined || query == 'undefined') {
        query = '';
      }

      switch (req.params.filter) {
        case 'posts':
          return this.createPostQuery(user['_groups'], query, JSON.parse(req.query.advancedFilters));
        case 'users':
          return this.createUserQuery(user, query, JSON.parse(req.query.advancedFilters));
        case 'files':
          return this.createFilesQuery(user['_groups'], query, JSON.parse(req.query.advancedFilters));
      }
    } catch (err) {
      sendErr(res, err);
    }
  };

  async createUserQuery(user, queryText, advancedFilters) {

    let query: any = {};
    if (advancedFilters.skills && advancedFilters.skills.length > 0) {
      query = {
        $and: [
          { _workspace: user._workspace._id || user._workspace },
          { active: { $eq : true }},
          {
            $or: [
              { first_name: { $regex: queryText, $options: 'i' } },
              { last_name: { $regex: queryText, $options: 'i' } },
              { email: { $regex: queryText, $options: 'i' } },
              { skills: { $regex: queryText, $options: 'i' } },
              { bio: { $regex: queryText, $options: 'i' } },
              { company_name: { $regex: queryText, $options: 'i' } },
              { phone_number: { $regex: queryText, $options: 'i' } },
              { role: { $regex: queryText, $options: 'i' } }
            ]
          },
          { skills: { $in: advancedFilters.skills } }
        ]
      };
    } else {
      query = {
        $and: [
          { _workspace: user._workspace._id || user._workspace },
          { active: { $eq : true }},
          {
            $or: [
              { first_name: { $regex: queryText, $options: 'i' } },
              { last_name: { $regex: queryText, $options: 'i' } },
              { email: { $regex: queryText, $options: 'i' } },
              { skills: { $regex: queryText, $options: 'i' } },
              { bio: { $regex: queryText, $options: 'i' } },
              { company_name: { $regex: queryText, $options: 'i' } },
              { phone_number: { $regex: queryText, $options: 'i' } },
              { role: { $regex: queryText, $options: 'i' } }
            ]
          }
        ]
      };
    }

    return await User.find(query)
      .sort({first_name: -1})
      .populate({ path: '_workspace', select: 'profile_custom_fields' })
      .lean();
  }

  async createPostQuery(userGroups, queryText, advancedFilters) {

    if (advancedFilters.owners.length > 0) {
      advancedFilters.owners = advancedFilters.owners.map(member => {
        return member._id;
      });
    }

    let query: any = {};
    if (advancedFilters.owners && advancedFilters.owners.length > 0
        && advancedFilters.tags && advancedFilters.tags.length > 0) {
      query = {
        $and: [
          { _group: { $in: userGroups } },
          {
            $or: [
              { content: { $regex: queryText, $options: 'i' } },
              { title: { $regex: queryText, $options: 'i' } },
              { tags: { $regex: queryText, $options: 'i' } }
            ]
          },
          { _posted_by: { $in: advancedFilters.owners } },
          { tags: { $in: advancedFilters.tags } }
        ]
      };
    } else if ((!advancedFilters.owners || advancedFilters.owners.length == 0)
        && advancedFilters.tags && advancedFilters.tags.length > 0) {
      query = {
        $and: [
          { _group: { $in: userGroups } },
          {
            $or: [
              { content: { $regex: queryText, $options: 'i' } },
              { title: { $regex: queryText, $options: 'i' } },
              { tags: { $regex: queryText, $options: 'i' } }
            ]
          },
          { tags: { $in: advancedFilters.tags } }
        ]
      };
    } else if ((advancedFilters.owners && advancedFilters.owners.length > 0)
        && (advancedFilters.tags || advancedFilters.tags.length == 0)) {
      query = {
        $and: [
          { _group: { $in: userGroups } },
          {
            $or: [
              { content: { $regex: queryText, $options: 'i' } },
              { title: { $regex: queryText, $options: 'i' } },
              { tags: { $regex: queryText, $options: 'i' } }
            ]
          },
          { _posted_by: { $in: advancedFilters.owners } }
        ]
      };
    } else {
      query = {
        $and: [
          { _group: { $in: userGroups } },
          {
            $or: [
              { content: { $regex: queryText, $options: 'i' } },
              { title: { $regex: queryText, $options: 'i' } },
              { tags: { $regex: queryText, $options: 'i' } }
            ]
          }
        ]
      };
    }

    let posts = await Post.find(query)
      .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
      .populate({ path: '_group', select: 'custom_fields' })
      .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
      .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
      .sort({ created_date: -1 })
      .lean();

    // Search on the comments
    let comments = await Comment.find({
        $and: [
          { content: { $regex: queryText, $options: 'i' } }
        ]    
      })
      .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
      .populate({ path: '_post', select: '_id _group' })
      .sort({ created_date: -1 })
      .lean();

    // Filter the comments by the groups of the user
    comments = comments.filter(comment => {
      return comment._post && comment._post._group
        && userGroups.findIndex(group => group == comment._post._group)
    });

    // add the comments´ posts to the array if they are not there yet
    comments.forEach(async comment => {
      const index = (comment && comment._post) ? posts.findIndex(post => post._id == (comment._post._id || comment._post)) : -1;
      if (comment && comment._post && index < 0) {
        const post = await Post.findOne({_id: (comment._post._id || comment._post)})
          .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
          .populate({ path: '_group', select: 'custom_fields' })
          .sort({ created_date: -1 })
          .lean();

        posts.push(post);
      }
    });

    return posts;
  }

  async createFilesQuery(userGroups, queryText, advancedFilters) {
    
    if (advancedFilters.owners.length > 0) {
      advancedFilters.owners = advancedFilters.owners.map(member => {
        return member._id;
      });
    }

    let query: any = {};
    if (advancedFilters.owners && advancedFilters.owners.length > 0
        && advancedFilters.tags && advancedFilters.tags.length > 0
        && advancedFilters.metadata && advancedFilters.metadata != '') {
      query = {
        $and: [
          { _group: { $in: userGroups } },
          {
            $or: [
              { original_name: { $regex: queryText, $options: 'i' } },
              { modified_name: { $regex: queryText, $options: 'i' } },
              { tags: { $regex: queryText, $options: 'i' }},
              { description: { $regex: queryText, $options: 'i' }},
              // { custom_fields: { $regex: queryText, $options: 'i' }},
            ]
          },
          { _posted_by: { $in: advancedFilters.owners } },
          { tags: { $in: advancedFilters.tags } },
          { description: { $regex: advancedFilters.metadata, $options: 'i' }},
        ]    
      };
    } else if ((!advancedFilters.owners || advancedFilters.owners.length == 0)
        && advancedFilters.tags && advancedFilters.tags.length > 0
        && advancedFilters.metadata && advancedFilters.metadata != '') {
      query = {
        $and: [
          { _group: { $in: userGroups } },
          {
            $or: [
              { original_name: { $regex: queryText, $options: 'i' } },
              { modified_name: { $regex: queryText, $options: 'i' } },
              { tags: { $regex: queryText, $options: 'i' }},
              { description: { $regex: queryText, $options: 'i' }},
              // { custom_fields: { $regex: queryText, $options: 'i' }},
            ]
          },
          { tags: { $in: advancedFilters.tags } },
          { description: { $regex: advancedFilters.metadata, $options: 'i' }},
        ]    
      };
    } else if ((advancedFilters.owners && advancedFilters.owners.length > 0)
        && (advancedFilters.tags || advancedFilters.tags.length == 0)
        && advancedFilters.metadata && advancedFilters.metadata != '') {
      query = {
        $and: [
          { _group: { $in: userGroups } },
          {
            $or: [
              { original_name: { $regex: queryText, $options: 'i' } },
              { modified_name: { $regex: queryText, $options: 'i' } },
              { tags: { $regex: queryText, $options: 'i' }},
              { description: { $regex: queryText, $options: 'i' }},
              // { custom_fields: { $regex: queryText, $options: 'i' }},
            ]
          },
          { _posted_by: { $in: advancedFilters.owners } },
          { description: { $regex: advancedFilters.metadata, $options: 'i' }},
        ]    
      };
    } else if ((advancedFilters.owners && advancedFilters.owners.length > 0)
        && advancedFilters.tags && advancedFilters.tags.length > 0
        && (!advancedFilters.metadata || advancedFilters.metadata == '')) {
      query = {
        $and: [
          { _group: { $in: userGroups } },
          {
            $or: [
              { original_name: { $regex: queryText, $options: 'i' } },
              { modified_name: { $regex: queryText, $options: 'i' } },
              { tags: { $regex: queryText, $options: 'i' }},
              { description: { $regex: queryText, $options: 'i' }},
              // { custom_fields: { $regex: queryText, $options: 'i' }},
            ]
          },
          { _posted_by: { $in: advancedFilters.owners } },
          { tags: { $in: advancedFilters.tags } }
        ]    
      };
    } else if ((!advancedFilters.owners || advancedFilters.owners.length == 0)
        && (advancedFilters.tags || advancedFilters.tags.length == 0)
        && advancedFilters.metadata && advancedFilters.metadata != '') {
      query = {
        $and: [
          { _group: { $in: userGroups } },
          {
            $or: [
              { original_name: { $regex: queryText, $options: 'i' } },
              { modified_name: { $regex: queryText, $options: 'i' } },
              { tags: { $regex: queryText, $options: 'i' }},
              { description: { $regex: queryText, $options: 'i' }},
              // { custom_fields: { $regex: queryText, $options: 'i' }},
            ]
          },
          { description: { $regex: advancedFilters.metadata, $options: 'i' }},
        ]    
      };
    } else if (advancedFilters.owners && advancedFilters.owners.length > 0
        && (advancedFilters.tags || advancedFilters.tags.length == 0)
        && (!advancedFilters.metadata || advancedFilters.metadata == '')) {
      query = {
        $and: [
          { _group: { $in: userGroups } },
          {
            $or: [
              { original_name: { $regex: queryText, $options: 'i' } },
              { modified_name: { $regex: queryText, $options: 'i' } },
              { tags: { $regex: queryText, $options: 'i' }},
              { description: { $regex: queryText, $options: 'i' }},
              // { custom_fields: { $regex: queryText, $options: 'i' }},
            ]
          },
          { _posted_by: { $in: advancedFilters.owners } },
        ]    
      };
    } else if ((!advancedFilters.owners || advancedFilters.owners.length == 0)
        && advancedFilters.tags && advancedFilters.tags.length > 0
        && (!advancedFilters.metadata || advancedFilters.metadata == '')) {
      query = {
        $and: [
          { _group: { $in: userGroups } },
          {
            $or: [
              { original_name: { $regex: queryText, $options: 'i' } },
              { modified_name: { $regex: queryText, $options: 'i' } },
              { tags: { $regex: queryText, $options: 'i' }},
              { description: { $regex: queryText, $options: 'i' }},
              // { custom_fields: { $regex: queryText, $options: 'i' }},
            ]
          },
          { tags: { $in: advancedFilters.tags } }
        ]    
      };
    } else {
      query = {
        $and: [
          { _group: { $in: userGroups } },
          {
            $or: [
              { original_name: { $regex: queryText, $options: 'i' } },
              { modified_name: { $regex: queryText, $options: 'i' } },
              { tags: { $regex: queryText, $options: 'i' }},
              { description: { $regex: queryText, $options: 'i' }},
              // { custom_fields: { $regex: queryText, $options: 'i' }},
            ]
          }
        ]    
      };
    }

    return await File.find(query)
      .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
      .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
      .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
      .populate({ path: '_group', select: 'custom_fields' })
      .sort({ created_date: -1 })
      .lean();
  }
}
