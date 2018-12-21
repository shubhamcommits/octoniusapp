const { Group, User } = require('../api/models');

const createPrivateGroups = async () => {

  // eslint-disable-next-line no-console
  console.log('---- Starting Migration -----');

  try {
    // Find all users that has no _private_group
    const users = await User.find({
      _private_group: { $exists: false }
    }, {
      first_name: 1,
      _private_group: 1,
      _workspace: 1,
      workspace_name: 1
    })
      .lean();

    // Create a new private group for each existent user that has no _private_group
    await users.forEach(async (user) => {
      // generate private group data
      const privateGroupData = {
        group_name: 'private',
        _workspace: user._workspace,
        _admins: user._id,
        workspace_name: user.workspace_name
      };

      // create private group
      const privateGroup = await Group.create(privateGroupData);

      // assign the private group for the user
      const userUpdate = await User.findByIdAndUpdate({
        _id: user._id
      }, {
        $set: {
          _private_group: privateGroup._id
        }
      }, {
        new: true
      });
    });

    // eslint-disable-next-line no-console
    console.log('---- Migration Finished! -----');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
};

module.exports = { createPrivateGroups };
