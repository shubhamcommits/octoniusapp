const User = require("../../models/user");
const Workspace = require("../../models/workspace");
const Group = require("../../models/group");
const Auth = require('../../models/auth');
const helper_password = require("../../helpers/password");
const jwt = require("jsonwebtoken");
const sendMail = require("../../sendgrid/sendMail");

module.exports = {
	signin(req, res, next) {
		console.log("--------Workspace Sign in Controller Api---------");

		let login_user = req.body;


		User.findOne({
			workspace_name: login_user.workspace_name,
			email: login_user.email
		})
			.populate('_workspace', 'workspace_name _id')
			.then((user) => {
				// user not found error
				if (user == null) {
					res.status(401).json({
						message: "Auth failed,Invalid Wrokspace name or user email!",
					});

				} else {

					let plainPassword = req.body.password;

					helper_password.decryptPassword(plainPassword, user.password)
						.then((response) => {
							if (response.password == true) {
								// generating jsonwebtoken 
								const payload = {
									subject: user._id
								};
								const token = jwt.sign(payload, process.env.JWT_KEY);

								// initialition new auth record
								let new_auth = {
									workspace_name: user.workspace_name,
									_user: user,
									token: token
								}
								// creating new auth record
								Auth.create(new_auth)
									.then((auth) => {
										let current_user = {
											user_id: user._id,
											workspace: user._workspace
										}
										res.status(200).json({
											message: "Sign in Successfull!",
											token: token,
											user: current_user
										});
									})
								// auth creation error
									.catch((err) => {
										res.status(500).json({
											message: "something went wrong | internal server error",
											error: err
										});
									})
							} else {
								res.status(401).json({
									message: "Auth failed,Invalid email or password!",
									password: response.password
								});
							}

						})
					// password decryption error
						.catch((error) => {
							res.status(401).json({
								message: "Auth failed,Invalid email or password!",
							});
						});
				}
			})
		// user finding error 
			.catch((error) => {
				res.status(500).json({
					message: "something went wrong | internal server error",
					error: error
				});
			})
	},

	// new user signup on existing workspace
	signup(req, res, next) {
		console.log("----------Workspace Sign up Controller Apis----------");
		console.log(req.user_role);
		let user_data = req.body;
		user_data.full_name = req.body.first_name + ' ' + req.body.last_name;

		let user_email_domain = req.body.email.split("@")[1];
		let user_email = req.body.email;


		// checking wroksapce existance and verifying user's email domain or invited users for signup
		// only allowed email domains holder users and invited users can signup on the workspace
		Workspace.findOne({
			$or: [{
				workspace_name: user_data.workspace_name,
				allowed_domains: user_email_domain
			}, {
				workspace_name: user_data.workspace_name,
				'invited_users.email': {
					$in: user_email
				}
			}]
		})
			.then((workspace) => {
				// if workspace does not exist
				if (workspace == null) {
					return res.status(404).json({
						message: "Error! workspace name is invalid or your email is not allowed to join this workspace"
					});
					// workspace exists and also user can join the workspace
				} else {
					//encrypting user password
					helper_password.encryptPassword(user_data.password)
						.then((response) => {

							user_data.password = response.password;
							user_data._workspace = workspace;
							user_data.role = 'member';

							// creating new user 
							User.create(user_data)
								.then((user) => {

									// adding the new user in Global group of workspace
									Group.findOneAndUpdate({
										group_name: 'Global',
										workspace_name: req.body.workspace_name
									}, {
										$push: {
											_members: user
										}
									})
										.then((global_group) => {
											// Updating user's groups list
											User.findByIdAndUpdate({
												_id: user._id
											}, {
												$push: {
													_groups: global_group
												}
											}, {
												new: true
											})
												.then((updated_user) => {

													// updating workspace's memebers list wih new user
													Workspace.findByIdAndUpdate({
														_id: workspace._id
													}, {
														$push: {
															members: user
														}
													}, {
														new: true
													})
														.then((updated_workspace) => {
															// generating jsonwebtoken 
															const payload = {
																subject: user._id
															};
															const token = jwt.sign(payload, process.env.JWT_KEY);

															// initialition new auth record
															let new_auth = {
																workspace_name: workspace.workspace_name,
																_user: user,
																token: token
															}
															// creating new auth record
															Auth.create(new_auth)
																.then((auth) => {
																	//console.log("inside auth then")
																	let current_user = {
																		user_id: user._id,
																		workspace: {
																			_id: workspace._id,
																			workspace_name: workspace.workspace_name
																		}
																	}
																	// everything is correct and now user can signup on workspace
																	res.status(200).json({
																		message: "Congratulations! you are now member of our workspace.",
																		token: token,
																		user: current_user

																	});
																	// Send signup confirmation email
																	sendMail.signup(user.email, user.first_name, null, null, null, null, workspace.workspace_name);

																})
															// auth creation error
																.catch((err) => {
																	console.log("inside auth catch");
																	res.status(500).json({
																		message: "something went wrong | internal server error auth creation error",
																		error: err
																	});
																})
														})
													// workspace updating error
														.catch((err) => {
															res.status(500).json({
																message: "something went wrong | Internal server error",
																error: err
															});
														})
												})
											// User's group list updation error
												.catch((err) => {
													res.status(500).json({
														message: "something went wrong | internal server error auth creation error",
														error: err
													});
												})
										})
									// Global group updation error
										.catch((err) => {
											res.status(500).json({
												message: "something went wrong | internal server error",
												error: err
											});
										})
								})
							// user creating error
								.catch((err) => {
									res.status(500).json({
										message: "something went wrong at user signup | Internal server error",
										error: err
									});
								})
						})
					// password encryption error
						.catch((err) => {
							res.status(401).json({
								message: "something went wrong with your password,try another password",
								error: err.message
							});
						})
				}
			})
		// workspace finding error
			.catch((error) => res.status(500).json({
				message: "something went wrong | internal server error",
				error
			}))
	},

	// signout user
	signOut(req, res, next) {

		let user_id = req.userId;

		Auth.findOneAndUpdate({
			_user: user_id,
			token: req.headers.authorization.split(' ')[1]
		}, {
			$set: {
				token: null,
				isLoggedIn: false
			}
		}, {
			new: true
		})
			.then((user) => {
				res.status(200).json({
					message: "User successfully! logged out",
				});

			})
			.catch((err) => {
				res.status(500).json({
					message: "something went wrong | internal server error",
					err
				});

			});

	},
	/*===================================================
			 Route to check the wrokspace name availbility
			===================================================*/
	checkWorkspaceName(req, res, next) {
		let workspace_data = req.body;
		console.log("============checking worksapce Name Availablity===========");
		console.log(workspace_data);

		Workspace.findOne({
			workspace_name: workspace_data.workspace_name
		})
			.then((workspace) => {
				// workspace does not found
				if (workspace == null) {

					res.status(200).json({
						message: "workspace name is available.",
						workspace
					});
				}
				// if workspace alread exists 
				else {
					res.status(409).json({
						message: "workspace name has already been taken,Please pick another name."
					});
				}
			})
			.catch((error) => res.status(500).json({
				message: "something went wrong | internal server error",
				error
			}))
	},

	// creating new workspace and new user with owner rights
	createNewWorkSpace(req, res, next) {

		console.log("============Creating New Workspace===========");
		console.log(req.body);

		// generating hash password fist
		helper_password.encryptPassword(req.body.owner_password)
			.then((hashPassword) => {

				let new_workspace = req.body;
				new_workspace.owner_password = hashPassword.password;
				// creating new workspace
				Workspace.create(new_workspace)
					.then((workspace) => {

						let new_user = {
							first_name: req.body.owner_first_name,
							last_name: req.body.owner_last_name,
							full_name: req.body.owner_first_name + ' ' + req.body.owner_last_name,
							email: req.body.owner_email,
							password: hashPassword.password,
							workspace_name: req.body.workspace_name,
							company_name: req.body.company_name,
							_workspace: workspace,
							role: 'owner'
						}
						// creating new user with owner rights
						User.create(new_user)
							.then((user) => {
								// updating  memebers and _owener fields of workspace
								Workspace.findByIdAndUpdate({
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
								})
									.then((updated_workspace) => {

										// initialization of global group
										let global_group = {
											group_name: 'Global',
											_workspace: workspace,
											_members: user,
											workspace_name: workspace.workspace_name,
										}
										// creating new gloabal group
										Group.create(global_group)
											.then((new_group) => {

												// generating jsonwebtoken 
												const payload = {
													subject: user._id
												};
												const token = jwt.sign(payload, process.env.JWT_KEY);

												// initialition new auth record 
												let new_auth = {
													workspace_name: workspace.workspace_name,
													_user: user,
													token: token
												}
												// creating new auth record
												Auth.create(new_auth)
													.then((auth) => {
														// everything is correct,user can create new workspace
														let current_user = {
															user_id: user._id,
															workspace: {
																_id: workspace._id,
																workspace_name: workspace.workspace_name
															}
														}
														res.status(200).json({
															message: "Workspace has created successfully!",
															token: token,
															user: current_user
														});

														// Send signup confirmation email
														sendMail.signup(new_user.email, new_user.first_name, null, null, null, null, workspace.workspace_name);

														// Send new workspace confirmation email
														sendMail.newWorkspace(new_user.email, new_user.first_name, null, null, null, null, workspace.workspace_name);

													})
												// auth creation error
													.catch((err) => {
														res.status(500).json({
															message: "something went wrong auth creation error | internal server error",
															error: err
														});
													})


											})
										// gloabl group creation error
											.catch((err) => {
												res.status(500).json({
													error: err,
													message: "something went wrong group creation error | internal server error occured!"
												})
											})

									})
								// workspace update error
									.catch((error) => {
										res.status(500).json({
											message: "something went wrong workspace update error | internal server error occured",
											error: error
										});
									})
							})
						// user creation error 
							.catch((err) => {
								res.status(500).json({
									message: "something went wrong user creation error  | internal server error occured",
									error: err
								});
							});

					})
				// workspace creation error
					.catch((err) => {
						res.status(500).json({
							message: "something went wrong  workspace creation error | internal server error occured",
							error: err
						});
					});
			})
		// password encryption error
			.catch((err) => {
				return res.status(403).json({
					message: "something went wrong with your password, Please try another one",
					error: err.message
				});
			})
	},



	/*=======================================================
		Route to check the user availability
		======================================================= */
	checkUserAvailability(req, res, next) {
		let user_data = req.body;

		Workspace.findOne({
			workspace_name: user_data.workspace_name
		})
			.then((workspace) => {
				// if workspace does not exists
				if (workspace == null) {
					return res.status(401).json({
						message: "Error! Invalid workspace name"
					})

				} else {
					User.findOne({
						workspace_name: user_data.workspace_name,
						email: user_data.email
					})
						.then((user) => {
							// if user is not the member of workspace now he/she can signup
							if (user == null) {
								res.status(200).json({
									message: "user can sign up with this email and workspace name"
								});
							} else {
								// if user alredy member of workspace then he can not signup again
								res.status(409).json({
									message: "you are already member of this workspace,go for sign in."
								});
							}
						})
					// user find error
						.catch((error) => {
							res.status(500).json({
								message: "something went wrong | internal server error",
								error
							});
						})
				}
			})
		// workspace find error
			.catch((error) => {
				res.status(500).json({
					message: "something went wrong | internal server error",
					error
				});
			})
	}

}
