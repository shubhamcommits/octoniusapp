const { User } = require('../models');

const  getUser = async (req, res, next) => {
  try {
    const userId = req.userId;

    const user = await User.findOne({
      _id: userId
    })
      .select('_id first_name last_name profile_pic email workspace_name bio company_join_date current_position role phone_number mobile_number company_name _workspace _groups');

    // User not found
    if (!user) {
      return sendErr(res, err, 'Error! User not found, invalid id or unauthorized request', 404);
    }

    return res.status(200).json({
      message: `User found!`,
      user
    });

  } catch (err) {
    return sendErr(res, err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const userId = req.userId;
    const userData = req.body;

    delete req.body.userId

    const user = await User.findByIdAndUpdate({
      _id: userId
    }, {
      $set: userData
    }, {
      new: true
    });

    return res.status(200).json({
      message: 'Profile updated!',
      user
    });

  } catch (err) {
    return sendErr(res, err);
  }
};

const updateUserImage = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate({
      _id: req.userId
    }, {
      profile_pic: req.fileName
    }, {
      new: true
    });

    return res.status(200).json({
      message: 'User profile picture updated!',
      user
    });

  } catch (err) {
    return sendErr(res, err);
  }
};

module.exports = {
  getUser,
  updateUser,
  updateUserImage
};
