import { Post, User, File, Comment, Collection, Page } from '../models';
import { sendErr } from '../utils/sendError';
import moment from 'moment';

/*  ===============================
 *  -- SEARCH Service --
 *  ===============================
 */

export class SearchService {

  async getSearchResults(req, res) {
    // Focus on only searching within own workspace
    try {
      const user = await User.findOne({ _id: req.userId }).lean();

      let query = req.query.textQuery;

      if (!query || query == undefined || query == 'undefined') {
        query = '';
      }

      switch (req.params.filter) {
        case 'pages':
          return this.createPageQuery(user['_groups'], query, JSON.parse(req.query.advancedFilters));
        case 'posts':
          return this.createPostQuery(user['_groups'], query, JSON.parse(req.query.advancedFilters));
        case 'tasks':
          return this.createTasksQuery(user['_groups'], query, JSON.parse(req.query.advancedFilters));
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

    let users = await User.find(query)
      .sort({first_name: -1})
      .populate({ path: '_workspace', select: 'profile_custom_fields' })
      .lean();

    if (advancedFilters.cfName && advancedFilters.cfValue && advancedFilters.cfName != '' && advancedFilters.cfValue != '') {
      users = users.filter(user => user?.profile_custom_fields
        && user?.profile_custom_fields[advancedFilters.cfName]
        && user?.profile_custom_fields[advancedFilters.cfName] == advancedFilters?.cfValue);
    }

    return users;
  }

  async createPostQuery(userGroups, queryText, advancedFilters) {

    if (advancedFilters.owners.length > 0) {
      advancedFilters.owners = advancedFilters.owners.map(member => {
        return member._id;
      });
    }

    let from_date;
    let to_date;
    if (advancedFilters.from_date) {
      from_date = moment(advancedFilters.from_date).startOf('day').format();
    } else {
      from_date = moment().subtract(40, 'years').format();
    }

    if (advancedFilters.to_date) {
      to_date = moment(advancedFilters.to_date).startOf('day').format();
    } else {
      to_date = moment().add(1, 'days').format();
    }

    let query: any = {};
    if (advancedFilters.owners && advancedFilters.owners.length > 0
        && advancedFilters.tags && advancedFilters.tags.length > 0) {
      query = {
        $and: [
          { _group: { $in: userGroups } },
          { type: { $ne: 'task' }},
          {
            $or: [
              { content: { $regex: queryText, $options: 'i' } },
              { title: { $regex: queryText, $options: 'i' } },
              { tags: { $regex: queryText, $options: 'i' } }
            ]
          },
          { _posted_by: { $in: advancedFilters.owners } },
          { tags: { $in: advancedFilters.tags } },
          { created_date: { $gte: from_date, $lte: to_date } }
        ]
      };
    } else if ((!advancedFilters.owners || advancedFilters.owners.length == 0)
        && advancedFilters.tags && advancedFilters.tags.length > 0) {
      query = {
        $and: [
          { _group: { $in: userGroups } },
          { type: { $ne: 'task' }},
          {
            $or: [
              { content: { $regex: queryText, $options: 'i' } },
              { title: { $regex: queryText, $options: 'i' } },
              { tags: { $regex: queryText, $options: 'i' } }
            ]
          },
          { tags: { $in: advancedFilters.tags } },
          { created_date: { $gte: from_date, $lte: to_date } }
        ]
      };
    } else if ((advancedFilters.owners && advancedFilters.owners.length > 0)
        && (advancedFilters.tags || advancedFilters.tags.length == 0)) {
      query = {
        $and: [
          { _group: { $in: userGroups } },
          { type: { $ne: 'task' }},
          {
            $or: [
              { content: { $regex: queryText, $options: 'i' } },
              { title: { $regex: queryText, $options: 'i' } },
              { tags: { $regex: queryText, $options: 'i' } }
            ]
          },
          { _posted_by: { $in: advancedFilters.owners } },
          { created_date: { $gte: from_date, $lte: to_date } }
        ]
      };
    } else {
      query = {
        $and: [
          { _group: { $in: userGroups } },
          { type: { $ne: 'task' }},
          {
            $or: [
              { content: { $regex: queryText, $options: 'i' } },
              { title: { $regex: queryText, $options: 'i' } },
              { tags: { $regex: queryText, $options: 'i' } }
            ]
          },
          { created_date: { $gte: from_date, $lte: to_date } }
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
    
    if (advancedFilters.group) {
      posts = posts.filter(post => post?._group && post?._group?._id == advancedFilters?.group);
    }

    if (advancedFilters.cfName && advancedFilters.cfValue && advancedFilters.cfName != '' && advancedFilters.cfValue != '') {
      posts = posts.filter(post => post?.custom_fields
        && post?.custom_fields[advancedFilters.cfName]
        && post?.custom_fields[advancedFilters.cfName] == advancedFilters?.cfValue);
    }

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
      return comment._post && comment._post.type != 'task'  && comment._post._group
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

  async createTasksQuery(userGroups, queryText, advancedFilters) {

    if (advancedFilters.owners.length > 0) {
      advancedFilters.owners = advancedFilters.owners.map(member => {
        return member._id;
      });
    }

    let from_date;
    let to_date;
    if (advancedFilters.from_date) {
      from_date = moment(advancedFilters.from_date).startOf('day').format();
    } else {
      from_date = moment().subtract(40, 'years').format();
    }

    if (advancedFilters.to_date) {
      to_date = moment(advancedFilters.to_date).startOf('day').format();
    } else {
      to_date = moment().add(1, 'days').format();
    }

    let query: any = {};
    if (advancedFilters.owners && advancedFilters.owners.length > 0
        && advancedFilters.tags && advancedFilters.tags.length > 0) {
      query = {
        $and: [
          { _group: { $in: userGroups } },
          { type: 'task' },
          {
            $or: [
              { content: { $regex: queryText, $options: 'i' } },
              { title: { $regex: queryText, $options: 'i' } },
              { tags: { $regex: queryText, $options: 'i' } }
            ]
          },
          { _posted_by: { $in: advancedFilters.owners } },
          { tags: { $in: advancedFilters.tags } },
          { created_date: { $gte: from_date, $lte: to_date } }
        ]
      };
    } else if ((!advancedFilters.owners || advancedFilters.owners.length == 0)
        && advancedFilters.tags && advancedFilters.tags.length > 0) {
      query = {
        $and: [
          { _group: { $in: userGroups } },
          { type: 'task' },
          {
            $or: [
              { content: { $regex: queryText, $options: 'i' } },
              { title: { $regex: queryText, $options: 'i' } },
              { tags: { $regex: queryText, $options: 'i' } }
            ]
          },
          { tags: { $in: advancedFilters.tags } },
          { created_date: { $gte: from_date, $lte: to_date } }
        ]
      };
    } else if ((advancedFilters.owners && advancedFilters.owners.length > 0)
        && (advancedFilters.tags || advancedFilters.tags.length == 0)) {
      query = {
        $and: [
          { _group: { $in: userGroups } },
          { type: 'task' },
          {
            $or: [
              { content: { $regex: queryText, $options: 'i' } },
              { title: { $regex: queryText, $options: 'i' } },
              { tags: { $regex: queryText, $options: 'i' } }
            ]
          },
          { _posted_by: { $in: advancedFilters.owners } },
          { created_date: { $gte: from_date, $lte: to_date } }
        ]
      };
    } else {
      query = {
        $and: [
          { _group: { $in: userGroups } },
          { type: 'task' },
          {
            $or: [
              { content: { $regex: queryText, $options: 'i' } },
              { title: { $regex: queryText, $options: 'i' } },
              { tags: { $regex: queryText, $options: 'i' } }
            ]
          },
          { created_date: { $gte: from_date, $lte: to_date } }
        ]
      };
    }

    let posts = await Post.find(query)
      .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
      .populate({ path: '_group', select: '_id group_name custom_fields' })
      .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
      .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
      .sort({ created_date: -1 })
      .lean();
    
    if (advancedFilters.group) {
      posts = posts.filter(post => post?._group && post?._group?._id == advancedFilters?.group);
    }

    if (advancedFilters.cfName && advancedFilters.cfValue && advancedFilters.cfName != '' && advancedFilters.cfValue != '') {
      posts = posts.filter(post => post?.custom_fields
        && post?.custom_fields[advancedFilters.cfName]
        && post?.custom_fields[advancedFilters.cfName] == advancedFilters?.cfValue);
    }
  

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
      return comment._post && comment._post.type == 'task' && comment._post._group
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

    let from_date;
    let to_date;
    if (advancedFilters.from_date) {
      from_date = moment(advancedFilters.from_date).format();
    } else {
      from_date = moment().subtract(40, 'years').format();
    }

    if (advancedFilters.to_date) {
      to_date = moment(advancedFilters.to_date).add(1, 'days').format();
    } else {
      to_date = moment().add(1, 'days').format();
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
              { description: { $regex: queryText, $options: 'i' }}
            ]
          },
          { _posted_by: { $in: advancedFilters.owners } },
          { tags: { $in: advancedFilters.tags } },
          { description: { $regex: advancedFilters.metadata, $options: 'i' }},
          { created_date: { $gte: from_date, $lte: to_date }},
          { _parent: null }
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
              { description: { $regex: queryText, $options: 'i' }}
            ]
          },
          { tags: { $in: advancedFilters.tags } },
          { description: { $regex: advancedFilters.metadata, $options: 'i' }},
          { created_date: { $gte: from_date, $lte: to_date } },
          { _parent: null }
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
              { description: { $regex: queryText, $options: 'i' }}
            ]
          },
          { _posted_by: { $in: advancedFilters.owners } },
          { description: { $regex: advancedFilters.metadata, $options: 'i' }},
          { created_date: { $gte: from_date, $lte: to_date } },
          { _parent: null }
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
              { description: { $regex: queryText, $options: 'i' }}
            ]
          },
          { _posted_by: { $in: advancedFilters.owners } },
          { tags: { $in: advancedFilters.tags } },
          { created_date: { $gte: from_date, $lte: to_date } },
          { _parent: null }
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
              { description: { $regex: queryText, $options: 'i' }}
            ]
          },
          { description: { $regex: advancedFilters.metadata, $options: 'i' }},
          { created_date: { $gte: from_date, $lte: to_date } },
          { _parent: null }
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
              { description: { $regex: queryText, $options: 'i' }}
            ]
          },
          { _posted_by: { $in: advancedFilters.owners } },
          { created_date: { $gte: from_date, $lte: to_date } },
          { _parent: null }
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
              { description: { $regex: queryText, $options: 'i' }}
            ]
          },
          { tags: { $in: advancedFilters.tags } },
          { created_date: { $gte: from_date, $lte: to_date } },
          { _parent: null }
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
              { description: { $regex: queryText, $options: 'i' }}
            ]
          },
          { created_date: { $gte: from_date, $lte: to_date } },
          { _parent: null }
        ]    
      };
    }

    let files = await File.find(query)
      .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
      .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
      .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
      .populate({ path: '_group', select: '_id group_name custom_fields' })
      .sort({ created_date: -1 })
      .lean();

    if (advancedFilters.group) {
      files = files.filter(file => file?._group && file?._group?._id == advancedFilters?.group);
    }

    if (advancedFilters.cfName && advancedFilters.cfValue && advancedFilters.cfName != '' && advancedFilters.cfValue != '') {
      files = files.filter(file => file?.custom_fields
        && file?.custom_fields[advancedFilters.cfName]
        && file?.custom_fields[advancedFilters.cfName] == advancedFilters?.cfValue);
    }

    return files;
  }

  async createPageQuery(userGroups, queryText, advancedFilters) {

    if (advancedFilters.owners && advancedFilters.owners.length > 0) {
      advancedFilters.owners = advancedFilters.owners.map(member => {
        return member._id;
      });
    }

    let from_date;
    let to_date;
    if (advancedFilters.from_date) {
      from_date = moment(advancedFilters.from_date).startOf('day').format();
    } else {
      from_date = moment().subtract(40, 'years').format();
    }

    if (advancedFilters.to_date) {
      to_date = moment(advancedFilters.to_date).startOf('day').format();
    } else {
      to_date = moment().add(1, 'days').format();
    }

    let collections = [];
    if (advancedFilters?.group) {
      collections = await Collection.find({ _group: advancedFilters.group }).select('_id').lean();
    } else {
      collections = await Collection.find({ _group: { $in: userGroups } }).select('_id').lean();
    }

    let collectionsIds = [];
    collections.forEach(collection => {
        collectionsIds.push(collection._id);
    });

    let query: any = {};
    if (advancedFilters.owners && advancedFilters.owners.length > 0) {
      query = {
        $and: [
          { _collection: { $in: collectionsIds } },
          {
            $or: [
              { content: { $regex: queryText, $options: 'i' } },
              { title: { $regex: queryText, $options: 'i' } }
            ]
          },
          { _posted_by: { $in: advancedFilters.owners } },
          { created_date: { $gte: from_date, $lte: to_date } }
        ]
      };
    } else {
      query = {
        $and: [
          { _collection: { $in: collectionsIds } },
          {
            $or: [
              { content: { $regex: queryText, $options: 'i' } },
              { title: { $regex: queryText, $options: 'i' } }
            ]
          },
          { created_date: { $gte: from_date, $lte: to_date } }
        ]
      };
    }

    let pages = await Page.find(query)
      .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
      .sort({ created_date: -1 })
      .lean();

    return pages;
  }

  async searchTasksForNS(userId: string, textQuery: any, groupId: any) {
    try {
      let query = {};
      if (groupId) {
        query = {
          $and: [
            { _group: groupId },
            { type: 'task' },
            { _parent: null },
            { 'task._column': { $ne: null }},
            {
              $or: [
                { content: { $regex: textQuery, $options: 'i' } },
                { title: { $regex: textQuery, $options: 'i' } },
                { tags: { $regex: textQuery, $options: 'i' } }
              ]
            }
          ]
        };
      } else {
        const user = await User.findOne({ _id: userId }).lean();

        query = {
          $and: [
            { _group: { $in: user['_groups'] } },
            { type: 'task' },
            { _parent: null },
            { 'task._column': { $ne: null }},
            {
              $or: [
                { content: { $regex: textQuery, $options: 'i' } },
                { title: { $regex: textQuery, $options: 'i' } },
                { tags: { $regex: textQuery, $options: 'i' } }
              ]
            }
          ]
        };
      }

      return await Post.find(query)
        .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
        .populate({ path: '_group', select: '_id group_name custom_fields' })
        .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
        .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
        .populate({ path: 'task._column', select: '_id title' })
        .sort({ created_date: -1 })
        .lean();

    } catch (err) {
      throw err;
    }
  }
}
