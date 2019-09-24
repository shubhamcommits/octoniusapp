const mongoose = require('mongoose');
const {
  Group, User, Workspace, Post
} = require('../models');

const { sendErr, billing } = require('../../utils');


/*  =============================
 *  -- WORKSPACE ADMIN METHODS --
 *  =============================
 */

// -| Workspace domains controllers |-

const addDomain = async (req, res, next) => {
  try {
    const {
      userId,
      params: { workspaceId },
      body: { domain }
    } = req;

    const workspace = await Workspace.findOneAndUpdate({
      _id: workspaceId,
      _owner: userId
    }, {
      $addToSet: {
        allowed_domains: domain
      }
    }, {
      new: true
    });

    if (!workspace) {
      return sendErr(res, '', 'Invalid workspace id or user in not the workspace owner', 404);
    }

    return res.status(200).json({
      message: "New domain was added to workspace's allowed domains!",
      allowedDomains: workspace.allowed_domains
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const deleteDomain = async (req, res, next) => {
  try {
    const {
      userId,
      params: { workspaceId, domain }
    } = req;

    // Remove domain from domains array
    const workspace = await Workspace.findOneAndUpdate({
      _id: workspaceId,
      _owner: userId
    }, {
      $pull: {
        allowed_domains: domain
      }
    }, {
      new: true
    });

    if (!workspace) {
      return sendErr(res, '', 'Invalid workspace id or user in not the workspace owner', 404);
    }

    // Disable all users from that domain
    const disabledUsers = await User.updateMany({
      workspace_name: workspace.workspace_name,
      email: { $regex: domain, $options: 'i' }
    }, {
      $set: { active: false }
    });

    // Get workspace members that must be deleted
    const membersToRemove = await User.find({
      _workspace: workspace._id,
      email: { $regex: domain, $options: 'i' }
    }, {
      first_name: 1,
      email: 1
    })
      .lean();

    // Generate an array of their ids
    const idsToRemove = [];

    for (const member of membersToRemove) {
      // Don't push workspace owner
      if (!workspace._owner.equals(member._id)) {
        idsToRemove.push(member._id);
      }
    }

    // Remove users ids from workspace's members & invited users
    const workspaceUpdated = await Workspace.findOneAndUpdate({
      _id: workspaceId,
      _owner: userId
    }, {
      $pullAll: {
        members: idsToRemove,
        invited_users: idsToRemove
      }
    }, {
      new: true
    });

    // Remove users from all group's _members & _admins
    await Group.update({
      $or: [
        { _members: req.params.userId },
        { _admins: req.params.userId }
      ]
    }, {
      $pullAll: {
        _members: idsToRemove,
        _admins: idsToRemove
      }
    }, {
      multi: true
    });

    return res.status(200).json({
      message: 'Domain removed from workspace. All users from this domain are disabled!',
      allowedDomains: workspaceUpdated.allowed_domains,
      disabledUsers
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const getDomains = async (req, res, next) => {
  try {
    const workspace = await Workspace.findOne({ _id: req.params.workspaceId });

    if (!workspace) {
      return sendErr(res, '', 'Invalid workspace id!', 404);
    }

    return res.status(200).json({
      message: `Found ${workspace.allowed_domains.length} domains allowed on this workspace!`,
      domains: workspace.allowed_domains
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

/**
 * Fetches the unique email domains that exist within
 * the given workspace that match the given query.
 */
const getUniqueEmailDomains = async (req, res) => {
  const { workspaceId, query } = req.params;

  try {
    // Get the emails
    let emails = await User.find({ _workspace: workspaceId }).select('email');
    emails = emails.map(userDoc => userDoc.email); // get rid of _id

    // Generate the domails
    const emailDomains = emails.map((email) => {
      const index = email.indexOf('@');
      return email.substring(index + 1);
    });

    // Remove duplicates
    let domains = Array.from(new Set(emailDomains));

    // Match the query
    domains = domains.filter(domain => domain.includes(query));
    return res.status(200).json({
      domains: domains.slice(0, 5) // Limit result to 5
    });
  } catch (error) {
    return sendErr(res, error);
  }
};

/**
 * Fetches the unique job positions that exist within
 * the given workspace that match the given query.
 */
const getUniqueJobPositions = async (req, res) => {
  const { workspaceId, query } = req.params;

  try {
    const positions = await User
      .find({
        _workspace: workspaceId,
        current_position: { $regex: new RegExp(query, 'i') }
      })
      .distinct('current_position')
      .where('current_position').ne(null);

    return res.status(200).json({
      positions: positions.slice(0, 5) // Limit results to 5
    });
  } catch (error) {
    return sendErr(res, error);
  }
};

/**
 * Fetches the unique skills that exist within
 * the given workspace that match the given query.
 */
const getUniqueSkills = async (req, res) => {
  const { workspaceId, query } = req.params;

  try {
    const users = await User
      .find({ _workspace: workspaceId })
      .select('skills')
      .where('skills').ne(null);

    // Get skills from user documents
    const skills = [];
    users.map(userDoc => userDoc.skills.map(skill => skills.push(skill)));

    // Remove duplicates
    let filteredSkills = Array.from(new Set(skills));

    // Match the query
    filteredSkills = filteredSkills.filter(skill => skill.includes(query));

    return res.status(200).json({
      skills: filteredSkills.slice(0, 5) // Limit result to 5
    });
  } catch (error) {
    return sendErr(res, error);
  }
};

// -| Workspace users controllers |-

const deleteUser = async (req, res, next) => {
  try {
    const {
      userId,
      params: { workspaceId }
    } = req;

    // Check if user is the workspace owner
    const workspace = await Workspace.find({
      _id: workspaceId,
      _owner: userId
    });

    if (!workspace) {
      return sendErr(res, '', 'Invalid workspace id or user is not the workspace owner', 404);
    }


    // Disable user
    const disabledUser = await User.findOneAndUpdate(
      {
        $and: [
          { _workspace: workspaceId },
          { _id: req.params.userId }
        ]
      },
      {
        $set: {
          _groups: [],
          active: false
        }
      }
    );


    // Remove user from workspace's members & invited users
    const updatedWorkSpace = await Workspace.findOneAndUpdate({
      _id: workspaceId,
      _owner: userId
    }, {
      $pull: {
        members: req.params.userId,
        invited_users: disabledUser.email,
      }
    }, {
      new: true
    });

    // Remove user from all group's _members & _admins
    await Group.update({
      $or: [
        { _members: req.params.userId },
        { _admins: req.params.userId }
      ]
    }, {
      $pull: {
        _members: req.params.userId,
        _admins: req.params.userId
      }
    }, {
      multi: true
    });

    // remove member from the billing list
    // billing.subtractUserFromSubscription(updatedWorkSpace);

    return res.status(200).json({
      message: 'User removed from workspace!',
      disabledUser
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const getWorkspaceMembers = async (req, res, next) => {
    try {
      const {workspaceId} = req.params;
      const workspaceMembers = await Workspace.findOne({
        _id: workspaceId
      })
      const userMembersQuery = await User.find({_id:{$in: workspaceMembers.members.map(e=> new mongoose.Types.ObjectId(e))}}
      ).sort('_id')
      .limit(11)
      .exec() 

      var moreUsersToLoad = false;
      if (userMembersQuery.length == 11){
        userMembersQuery.pop()
        moreUsersToLoad = true;
      }
        return res.status(200).json({ 
          message: `${ userMembersQuery.length } workspace members found !`,
          results: userMembersQuery,
          moreToLoad: moreUsersToLoad });
       
      
    } catch (err) {
      // console.log('err', err);
      sendErr(res, err);
    }
  };
  const getNextWorkspaceMembers = async (req, res, next) => {
      try {
        const {workspaceId ,amountLoaded } = req.params;
        const workspaceMembers = await Workspace.findOne({
          _id: workspaceId
        })

       const memberCheck = await workspaceMembers.members.filter(e=> 
         new mongoose.Types.ObjectId(e).getTimestamp() > new mongoose.Types.ObjectId(amountLoaded).getTimestamp()
       
        )

        const userMembersQuery = await User.find({_id:{$in: memberCheck.map(e=> 
          new mongoose.Types.ObjectId(e)
        )}}
        ).sort('_id')
        .limit(6)
        .exec() 
  
        var moreUsersToLoad = false;
        if (userMembersQuery.length == 6){
          userMembersQuery.pop()
          moreUsersToLoad = true;
        }
        return res.status(200).json({ 
          message: `Next ${ userMembersQuery.length } workspace members found !`,
          results: userMembersQuery,
          moreToLoad: moreUsersToLoad });
         
        
      } catch (err) {
        // console.log('err', err);
        sendErr(res, err);
      }
    };

/*  =============
 *  -- EXPORTS --
 *  =============
 */

module.exports = {
  // domains
  addDomain,
  deleteDomain,
  getDomains,
  getUniqueEmailDomains,
  getUniqueJobPositions,
  getUniqueSkills,
  // users
  deleteUser,
  getWorkspaceMembers,
  getNextWorkspaceMembers,
};


// //  for a single payment
// const charge = await stripe.charges.create({
//   amount: 999,
//   currency: 'usd',
//   source: 'tok_visa',
//   receipt_email: 'jenny.rosen@example.com'
// });
//
//   // create a new product
//   const product = stripe.products.create({
//       name: 'Octonius subscription',
//       type: 'service'
//   });
//
//   // create a plan
//   const plan = stripe.plans.create({
//       product: 'prod_CbvTFuXWh7BPJH',
//       nickname: 'SaaS Platform USD',
//       currency: 'usd',
//       interval: 'month',
//       amount: 10000
//   });
// // create a new customer
//   const customer = stripe.customers.create({
//       email: 'jenny.rosen@example.com',
//       source: 'src_18eYalAHEMiOZZp1l9ZTjSU0',
//   });

// // subscribe the customer to the plan
// // You now have a customer subscribed to a plan.
// // Behind the scenes, Stripe creates an invoice for every billing cycle.
// // The invoice outlines what the customer owes, reflects when they will be or were charged, and tracks the payment status.
// // You can even add additional items to an invoice to factor in one-off charges like setup fees.
// const subscription = stripe.subscriptions.create({
//   customer: 'cus_4fdAW5ftNQow1a',
//   items: [{ plan: 'plan_CBXbz9i7AIOTzr' }]
// });
