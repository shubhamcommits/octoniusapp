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
      const user = await User.findOne({ _id: req.userId });

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
        case 'comments':
          return this.createCommentsQuery(query, JSON.parse(req.query.advancedFilters));
      }
    } catch (err) {
      sendErr(res, err);
    }
  };

  async createPostQuery(userGroups, query, advancedFilters) {

    if (advancedFilters.owners.length > 0) {
      advancedFilters.owners = advancedFilters.owners.map(member => {
        return member._id;
      });
    }

    return Post.aggregate([
      {
        $match: {
          $and: [
            { _group: { $in: userGroups } },
            {
              $or: [
                { content: { $regex: query, $options: 'i' } },
                { title: { $regex: query, $options: 'i' } },
                { tags: { $regex: query, $options: 'i' } }
              ]
            },
            // { _posted_by: { $in: advancedFilters.owners } },
            // { tags: { $in: advancedFilters.tags } }
          ]    
        }
      },
    ]).sort({ created_date: -1 });
  }

  async createUserQuery(user, query, advancedFilters) {
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
        },
        //{ skills: { $in: advancedFilters.skills } }
      ]
    });
  }

  async createFilesQuery(userGroups, query, advancedFilters) {
    
    if (advancedFilters.owners.length > 0) {
      advancedFilters.owners = advancedFilters.owners.map(member => {
        return member._id;
      });
    }

    return File.aggregate([
      {
        $match: {
          $and: [
            { _group: { $in: userGroups } },
            {
              $or: [
                { original_name: { $regex: query, $options: 'i' } },
                { modified_name: { $regex: query, $options: 'i' } },
                { tags: { $regex: query, $options: 'i' }},
                // { description: { $regex: query, $options: 'i' }},
                // { custom_fields: { $regex: query, $options: 'i' }},
              ]
            },
            //{ _posted_by: { $in: advancedFilters.owners } },
            //{ tags: { $in: advancedFilters.tags } },
            //{ description: { $regex: advancedFilters.metadata, $options: 'i' }},
          ]    
        }
      },
    ]).sort({ created_date: -1 });
  }

  async createCommentsQuery(query, advancedFilters) {
    return Comment.aggregate([
      {
        $lookup: {
          from: 'posts',
          localField: '_post',
          foreignField: '_id',
          as: 'post'
        }
      },
      {
        $match: {
          $and: [
            { content: { $regex: query, $options: 'i' } }
          ]    
        }
      }
    ]).sort({ created_date: -1 });
  }
}
