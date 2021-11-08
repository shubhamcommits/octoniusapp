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

      switch (req.params.filter) {
        case 'posts':
          return this.createPostQuery(user['_groups'], req.params.query);
        case 'users':
          return this.createUserQuery(user, req.params.query);
        case 'files':
          return this.createFilesQuery(user['_groups'], req.params.query);
        case 'comments':
          return this.createCommentsQuery(req.params.query);
      }
    } catch (err) {
      sendErr(res, err);
    }
  };

  async createPostQuery(userGroups, query) {
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
            }
          ]    
        }
      },
    ]).sort({ created_date: -1 });
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
    return File.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: '_posted_by',
          foreignField: '_id',
          as: 'postedBy'
        }
      },
      {
        $lookup: {
          from: 'groups',
          localField: '_group',
          foreignField: '_id',
          as: 'group'
        }
      },
      {
        $match: {
          $and: [
            { _group: { $in: userGroups } },
            {
              $or: [
                { original_name: { $regex: query, $options: 'i' } },
                { modified_name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' }},
                { tags: { $regex: query, $options: 'i' }},
              ]
            }
          ]    
        }
      },
    ]).sort({ created_date: -1 });
  }

  async createCommentsQuery(query) {
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
