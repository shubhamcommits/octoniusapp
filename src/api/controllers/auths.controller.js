const jwt = require('jsonwebtoken');

const { Auth, Group, User, Workspace } = require('../models');
const { sendErr, sendMail, passwordHelper } = require('../../utils');

/*	==================
 *	-- AUTH METHODS --
 *	==================
 */

const signIn = async (req, res, next) => {
	try {
    const {
      email,
      password,
      workspace_name
    } = req.body;

		const user = await User.findOne({
			workspace_name: workspace_name,
			email: email
		}).populate('_workspace', 'workspace_name _id');

    // If user wasn't found or user was previsously removed/disabled, return error
		if (!user || user.active === false) {
			return sendErr(res, '', 'Please enter a valid Workspace name or user email!', 401);
		} 

		const passDecrypted = await passwordHelper.decryptPassword(password, user.password);

		if (!passDecrypted.password) {
			return sendErr(res, '', 'Please enter a valid email or password!', 401);
		}

		// Generate jsonwebtoken 
		const payload = {
			subject: user._id
		};
		const token = await jwt.sign(payload, process.env.JWT_KEY);

		// Initialize new auth record
		const newAuth = {
			workspace_name: user.workspace_name,
			_user: user,
			token: token
		}

		// Create new auth record
		const auth = await Auth.create(newAuth);

		const currentUser = {
			user_id: user._id,
			workspace: user._workspace
		}

		return res.status(200).json({
			message: `User signed in ${user.workspace_name} Workspace!`,
			token: token,
			user: currentUser
		});

	} catch (err) {
		return sendErr(res, err, 'Error, username');
	}
};

// New user sign up on an existing workspace
const signUp = async (req, res, next) => {
	try {
		const userData = req.body;
		const userEmailDomain = req.body.email.split('@')[1];
		const userEmail = req.body.email;

		userData.full_name = `${req.body.first_name} ${req.body.last_name}`;

		const workspace = await Workspace.findOne({
			$or: [{
				workspace_name: userData.workspace_name,
				allowed_domains: userEmailDomain
			}, {
				workspace_name: userData.workspace_name,
				invited_users: userEmail
			}]
		});

		// Workspace not found!
		if (!workspace) {
			return sendErr(res, '', 'Workspace does not exist or this email is not allowed to join this workspace', 404);
		}

    //    - User email belongs to a disbled user? Y-Enable user, N-Signup user
    //    - Remove user from invited users list

    // If is a User previously removed/disabled on this workspace, enable user
    //    const disabledUser = await User.findOne({
    //      email: userEmail,
    //      active: false
    //    });
    //
    //    if (!!disabledUser) {
    //
    //    }
    
		// Encrypting user password
		const passEncrypted = await passwordHelper.encryptPassword(userData.password);

		// Error creating the password
		if (!passEncrypted) {
			return sendErr(res, '', 'An error ocurred trying to create the password, please choose another password!', 401);
		}

		userData.password = passEncrypted.password;
		userData._workspace = workspace;
		userData.role = 'member';

		// Create new user 
		const user = await User.create(userData);

		// Error creating the new user
		if (!user) {
			return sendErr(res, '', 'Some error ocurred trying to create the new user!');
		}

		// Add new user to workspace's Global group
		const globalGroupUpdate = await Group.findOneAndUpdate({
			group_name: 'Global',
			workspace_name: req.body.workspace_name
		}, {
			$push: {
				_members: user
			}
		});

		// Error updating the Global group
		if (!globalGroupUpdate) {
			return sendErr(res, '', 'Some error ocurred trying to update the Global group!');
		}

		// Add Global group to user's groups
		const userUpdate = await User.findByIdAndUpdate({
			_id: user._id
		}, {
			$push: {
				_groups: globalGroupUpdate
			}
		}, {
			new: true
		});

		// Error updating the user
		if (!userUpdate) {
			return sendErr(res, '', 'Some error ocurred trying to update the user!');
		}

		// Add new user to workpace members and remove user email from invited users
		const workspaceUpdate = await Workspace.findByIdAndUpdate({
			_id: workspace._id
		}, {
			$push: {
				members: user
      },
      $pull: {
        invited_users: user.email
      }
		}, {
			new: true
		});

		// Error updating the Workspace
		if (!workspaceUpdate) {
			return sendErr(res, '', 'Some error ocurred trying to update the Workspace!');
		}

		// Generate jsonwebtoken 
		const payload = {
			subject: user._id
		};
		const token = await jwt.sign(payload, process.env.JWT_KEY);

		// Initialize new auth record
		const newAuth = {
			workspace_name: workspaceUpdate.workspace_name,
			_user: user,
			token: token
		};

		// Create new auth record
		const auth = await Auth.create(newAuth)

		// Error on auth creation
		if (!auth) {
			return sendErr(res, '', 'Something went wrong on Auth creation!');
		}

		const currentUser = {
			user_id: user._id,
			workspace: {
				_id: workspaceUpdate._id,
				workspace_name: workspaceUpdate.workspace_name
			}
		};

		// Send signup confirmation email
		sendMail.signup(userUpdate);

		// Signup user and return the token
		return res.status(201).json({
			message: `Welcome to ${workspaceUpdate.workspace_name} Workspace!`,
			token: token,
			user: currentUser
		});

	} catch (err) {
		return sendErr(res, err);
	}
};

const signOut = async (req, res, next) => {
	try {

		const user = await Auth.findOneAndUpdate({
			_user: req.userId,
			token: req.headers.authorization.split(' ')[1]
		}, {
			$set: {
				token: null,
				isLoggedIn: false
			}
		}, {
			new: true
		});

		return res.status(200).json({
			message: 'User logged out!',
		});

	} catch (err) {
		return sendErr(res, err);
	}
};

/*	=========================================
 *	-- WORKSPACE AVAILABILITY AND CREATION --
 *	=========================================
 */

const checkWorkspaceName = async (req, res, next) => {
	try {
		const workspace = await Workspace.findOne({ workspace_name: req.body.workspace_name });

		// Workspace name already exists
		if (workspace) {
			return sendErr(res, '', 'This Workspace name has already been taken, please pick another name!', 409);

		} else {

			// Allow user to pick this name
			return res.status(200).json({
				message: 'This Workspace name is available.',
				workspace
			});
		}

	} catch (err) {
		return sendErr(res, err);
	}
};

const createNewWorkspace = async (req, res, next) => {
	try {
		// Generate hash password
		const passEncrypted = await passwordHelper.encryptPassword(req.body.owner_password);

		// Error creating the password
		if (!passEncrypted) {
			return sendErr(res, '', 'An error ocurred trying to create the password, please choose another password!', 401);
		}

		// Prepare workspace data before creation
		const new_workspace = req.body;
		new_workspace.owner_password = passEncrypted.password;

		// Create new workspace
		const workspace = await	Workspace.create(new_workspace);

		// Error creating workspace
		if (!workspace) {
			return sendErr(res, '', 'Some error ocurred trying to create the workspace!');
		}

		// Prepare new user data
		const newUser = {
			first_name: req.body.owner_first_name,
			last_name: req.body.owner_last_name,
			full_name: `${req.body.owner_first_name} ${req.body.owner_last_name}`,
			email: req.body.owner_email,
			password: passEncrypted.password,
			workspace_name: req.body.workspace_name,
			company_name: req.body.company_name,
			_workspace: workspace,
			role: 'owner'
		}

		// Create new user with owner rights
		const user = await User.create(newUser);

		// Error creating user
		if (!user) {
			return sendErr(res, '', 'Some error ocurred trying to create the user!');
		}

		// Pass user as workspace member and _owner
		const workspaceUpdate = await Workspace.findByIdAndUpdate({
			_id: workspace._id
		}, {
			$set: {
				_owner: user,
			},
			$push: {
				members: user
			}
		}, {
			new: true
		});

		// Error updating the workspace
		if (!workspaceUpdate) {
			return sendErr(res, '', 'Some error ocurred trying to update the workspace!');
		}

		// Pepare global group data
		const globalGroup = {
			group_name: 'Global',
			_workspace: workspaceUpdate,
			_members: user,
			workspace_name: workspaceUpdate.workspace_name, 
		}

		// Create new global group
		const group = await Group.create(globalGroup);

		// Error creating global group
		if (!group) {
			return sendErr(res, '', 'Some error ocurred trying to create the global group!');
		}

		// Add Global group to user's groups
		const userUpdate = await User.findByIdAndUpdate({
			_id: user._id
		}, {
			$push: {
				_groups: group
			}
		}, {
			new: true
		});

		// Error updating the user
		if (!userUpdate) {
			return sendErr(res, '', 'Some error ocurred trying to update the user!');
		}

		// generating jsonwebtoken 
		const payload = {
			subject: userUpdate._id
		};

		const token = await jwt.sign(payload, process.env.JWT_KEY);

		// Initialize new auth record
		const new_auth = {
			workspace_name: workspaceUpdate.workspace_name,
			_user: userUpdate,
			token: token
		};

		// Create new auth record
		const auth = await Auth.create(new_auth);

		// Error on auth creation
		if (!auth) {
			return sendErr(res, '', 'Something went wrong on Auth creation!');
		}

		// everything is correct,user can create new workspace
		const currentUser = {
			user_id: userUpdate._id,
			workspace: {
				_id: workspaceUpdate._id,
				workspace_name: workspaceUpdate.workspace_name
			}
		};

		// Send signup confirmation email
		sendMail.signup(userUpdate);

		// Send new workspace confirmation email
		sendMail.newWorkspace(workspaceUpdate);

		return res.status(200).json({
			message: 'Workspace created!',
			token: token,
			user: currentUser
		});

	} catch (err) {
		return sendErr(res, err);
	}
};

/*	=======================
 *	-- USER AVAILABILITY --
 *	=======================
 */

const checkUserAvailability = async (req, res, next) => {
	try {
		const userData = req.body;

		const workspace = await Workspace.findOne({ workspace_name: userData.workspace_name });

		// Workspace not found
		if (!workspace) {
			return sendErr(res, err, 'Invalid workspace name!', 401);
		} 

		const user = await User.findOne({
			workspace_name: userData.workspace_name,
			email: userData.email
		});

		// If user is already a member, user must sign in
		if (user) {
			return sendErr(res, err, 'You are already a member of this workspace, please sign in!', 409);
		}

		return res.status(200).json({
			message: 'user can sign up with this email and workspace name'
		});

	} catch (err) {
		return sendErr(res, err);
	}
};

/*	=============
 *	-- EXPORTS --
 *	=============
 */

module.exports = {
	signIn,
	signUp,
	signOut,
	checkWorkspaceName,
	createNewWorkspace,
	checkUserAvailability
}
