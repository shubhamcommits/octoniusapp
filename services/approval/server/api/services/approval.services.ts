import moment from 'moment';
import { Post, User, File, Comment } from '../models';
import { sendErr } from '../utils/sendError';

/*  ===============================
 *  -- APPROVAL Service --
 *  ===============================
 */

export class ApprovalService {

  async activateApprovalForItem(itemId: string, type: string, approval: boolean, userId: string) {
    try {
      switch (type) {
        case 'file':
          if (approval) {
            return await File.findOneAndUpdate(
              { _id: itemId},
              {
                $set: {
                  approval_active: approval
                },
                $push: {
                  approval_history: {
                    _actor: userId,
                    rejection_description: '',
                    action: 'created',
                    approval_date: moment().format()
                  }
                }
              })
            .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
            .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic' })
            .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
            .populate({ path: '_group', select: 'custom_fields' })
            .lean();
          } else {
            return await File.findOneAndUpdate(
              { _id: itemId},
              {
                $set: {
                  approval_flow: [],
                  approval_flow_launched: false,
                  approval_active: false
                },
                $push: {
                  approval_history: {
                    _actor: userId,
                    rejection_description: '',
                    action: 'deleted',
                    approval_date: moment().format()
                  }
                }
              })
            .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
            .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic' })
            .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
            .populate({ path: '_group', select: 'custom_fields' })
            .lean();
          }
        case 'post':
          if (approval) {
            return await Post.findOneAndUpdate(
              { _id: itemId}, 
              {
                $set: {
                  approval_active: approval
                },
                $push: {
                  approval_history: {
                    _actor: userId,
                    rejection_description: '',
                    action: 'created',
                    approval_date: moment().format()
                  }
                }
              })
            .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
            .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic' })
            .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
            .populate({ path: '_group', select: 'custom_fields' })
            .lean();
          } else {
            return await Post.findOneAndUpdate(
              { _id: itemId}, 
              {
                $set: {
                  approval_flow: [],
                  approval_flow_launched: false,
                  approval_active: false
                },
                $push: {
                  approval_history: {
                    _actor: userId,
                    rejection_description: '',
                    action: 'deleted',
                    approval_date: moment().format()
                  }
                }
              })
            .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
            .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic' })
            .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
            .populate({ path: '_group', select: 'custom_fields' })
            .lean();
          }
      }
    } catch (err) {
      throw err;
    }
  };

  async addUserToFlow(itemId: string, type: string, userId: string) {
    try {
      switch (type) {
        case 'file':
          let file: any = await File.findById({ _id: itemId });
          let approvalFile = file['approval_flow'].create({
            _assigned_to: userId,
            confirmed: false,
            confirmation_date: null
          });
          file['approval_flow'].push(approvalFile);
          await file.save();

          return await File.findById(itemId)
            .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
            .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic' })
            .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
            .populate({ path: '_group', select: 'custom_fields' })
            .lean();
        case 'post':
          let post: any = await Post.findById({ _id: itemId });
          let approvalPost = post['approval_flow'].create({
            _assigned_to: userId,
            confirmed: false,
            confirmation_date: null
          });
          post['approval_flow'].push(approvalPost);
          await post.save();

          return await Post.findById(itemId)
            .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
            .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic' })
            .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
            .populate({ path: '_group', select: 'custom_fields' })
            .lean();
      }
    } catch (err) {
      throw err;
    }
  };

  async removeUserFromFlow(itemId: string, type: string, approvalId: string) {
    try {
      switch (type) {
        case 'file':
          return await File.findByIdAndUpdate(
            { _id: itemId },
            {
              $pull: {
                approval_flow: {
                  _id: approvalId
                }
              }
            })
            .lean();
        case 'post':
          return await Post.findByIdAndUpdate(
            { _id: itemId },
            {
              $pull: {
                approval_flow: {
                  _id: approvalId
                }
              }
            })
            .lean();
      }
    } catch (err) {
      throw err;
    }
  };

  async launchApprovalFlow(itemId: string, type: string, approval_flow_launched: boolean, userId: string) {
    try {
      switch (type) {
        case 'file':
          return await File.findOneAndUpdate(
              { _id: itemId}, 
              {
                $set: {
                  approval_flow_launched: approval_flow_launched || false
                },
                $push: {
                  approval_history: {
                    _actor: userId,
                    rejection_description: '',
                    action: 'launch',
                    approval_date: moment().format()
                  }
                }
              })
            .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
            .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic' })
            .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
            .populate({ path: '_group', select: 'custom_fields' })
            .lean();
        case 'post':
          return await Post.findOneAndUpdate(
              { _id: itemId}, 
              {
                $set: {
                  approval_flow_launched: approval_flow_launched || false
                },
                $push: {
                  approval_history: {
                    _actor: userId,
                    rejection_description: '',
                    action: 'launch',
                    approval_date: moment().format()
                  }
                }
              })
            .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
            .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic' })
            .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
            .populate({ path: '_group', select: 'custom_fields' })
            .lean();
      }
    } catch (err) {
      throw err;
    }
  };

  async approveItem(itemId: string, type: string, approvalId: string) {
    try {
      const confirmationCode = await this.generateConfirmationCode();
      let item: any;
      switch (type) {
        case 'file':
          item = await File.findOneAndUpdate(
              { _id: itemId}, 
              {
                $set: {
                  "approval_flow.$[approval].confirmation_code": confirmationCode
                }
              },
              {
                arrayFilters: [{ "approval._id": approvalId }],
                new: true
              })
            .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
            .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic' })
            .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
            .populate({ path: '_group', select: 'custom_fields' })
            .lean();
        case 'post':
          item = await Post.findOneAndUpdate(
              { _id: itemId}, 
              {
                $set: {
                  "approval_flow.$[approval].confirmation_code": confirmationCode
                }
              },
              {
                arrayFilters: [{ "approval._id": approvalId }],
                new: true
              })
            .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
            .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic' })
            .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
            .populate({ path: '_group', select: 'custom_fields' })
            .lean();
      }

      // TODO - SEND EMAIL

      return item;
    } catch (err) {
      throw err;
    }
  };

  async rejectItem(itemId: string, type: string, approvalId: string, description: string, userId: string) {
    try {
      const confirmationCode = await this.generateConfirmationCode();
      let item: any;
      switch (type) {
        case 'file':
          item = await File.findOneAndUpdate(
              { _id: itemId}, 
              {
                $set: {
                  approval_flow: [],
                  approval_flow_launched: false
                },
                $push: {
                  approval_history: {
                    _actor: userId,
                    rejection_description: description,
                    action: 'rejected',
                    approval_date: moment().format()
                  }
                }
              },
              {
                new: true
              })
            .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
            .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic' })
            .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
            .populate({ path: '_group', select: 'custom_fields' })
            .lean();
        case 'post':
          item = await Post.findOneAndUpdate(
              { _id: itemId}, 
              {
                $set: {
                  approval_flow: [],
                  approval_flow_launched: false
                },
                $push: {
                  approval_history: {
                    _actor: userId,
                    rejection_description: description,
                    action: 'rejected',
                    approval_date: moment().format()
                  }
                }
              },
              {
                new: true
              })
            .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
            .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic' })
            .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
            .populate({ path: '_group', select: 'custom_fields' })
            .lean();
      }

      // TODO - SEND EMAIL

      return item;
    } catch (err) {
      throw err;
    }
  };

  async confirmAction(itemId: string, type: string, approvalId: string, code: string, userId: string) {
    try {
      switch (type) {
        case 'file':
          const fileDB = await File.findById({_id: itemId}).lean();
          const approvalFileIndex = (fileDB && fileDB.approval_flow) ? fileDB.approval_flow.findIndex(approval => approval._id == approvalId) : -1;
          if (approvalFileIndex >= 0) {
            if (fileDB.approval_flow[approvalFileIndex].confirmation_code == code) {
              // TODO - find the way to do the update in one call
              await File.findOneAndUpdate(
                { _id: itemId}, 
                {
                  $set: {
                    "approval_flow.$[approval].confirmation_date": moment().format(),
                  },
                  $push: {
                      approval_history: {
                      _actor: userId,
                      rejection_description: '',
                      action: 'approved',
                      approval_date: moment().format()
                    }
                  }
                },
                {
                  arrayFilters: [{ "approval._id": approvalId }],
                  new: true
                }).lean();
              
              return await File.findOneAndUpdate(
                { _id: itemId}, 
                {
                  $set: {
                    "approval_flow.$[approval].confirmed": true,
                  },
                  $push: {
                      approval_history: {
                      _actor: userId,
                      rejection_description: '',
                      action: 'approved',
                      approval_date: moment().format()
                    }
                  }
                },
                {
                  arrayFilters: [{ "approval._id": approvalId }],
                  new: true
                })
              .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
              .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic' })
            .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
              .populate({ path: '_group', select: 'custom_fields' })
              .lean();
            } else {
              throw new Error("The code inserted doesn´t match the confirmation code.");
            }
          } else {
            throw new Error("There is no approval with the id provided.");
          }
        case 'post':
          const postDB = await Post.findById({_id: itemId}).lean();
          const approvalPostIndex = (postDB && postDB.approval_flow) ? postDB.approval_flow.findIndex(approval => approval._id == approvalId) : -1;
          if (approvalPostIndex >= 0) {
            if (postDB.approval_flow[approvalPostIndex].confirmation_code == code) {
              // TODO - find the way to do the update in one call
              await Post.findOneAndUpdate(
                { _id: itemId}, 
                {
                  $set: {
                    "approval_flow.$[approval].confirmation_date": moment().format(),
                  }
                },
                {
                  arrayFilters: [{ "approval._id": approvalId }],
                  new: true
                }).lean();
              
              return await Post.findOneAndUpdate(
                { _id: itemId}, 
                {
                  $set: {
                    "approval_flow.$[approval].confirmed": true,
                  },
                  $push: {
                      approval_history: {
                      _actor: userId,
                      rejection_description: '',
                      action: 'approved',
                      approval_date: moment().format()
                    }
                  }
                },
                {
                  arrayFilters: [{ "approval._id": approvalId }],
                  new: true
                })
              .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
              .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic' })
            .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
              .populate({ path: '_group', select: 'custom_fields' })
              .lean();
            } else {
              throw new Error("The code inserted doesn´t match the confirmation code.");
            }
          } else {
            throw new Error("There is no approval with the id provided.");
          }
      }
    } catch (err) {
      throw err;
    }
  };

  /**
   * This method is used to generate a random Confirmation Code for each approval
   */
  async generateConfirmationCode() {
      const resultLength = 6;
      let result = '';
      const characters = '0123456789';
      const charactersLength = characters.length;
      for ( var i = 0; i < resultLength; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
  }
}
