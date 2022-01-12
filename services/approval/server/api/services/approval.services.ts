import moment from 'moment';
import { Post, File, Workspace } from '../models';
import { axios } from '../utils';
import http from 'axios';

import * as CryptoJS from 'crypto-js';

/*  ===============================
 *  -- APPROVAL Service --
 *  ===============================
 */
export class ApprovalService {

  fileFieldsForCrypto = 'original_name modified_name type mime_type created_date _posted_by _group description _description_mentions tags custom_fields';
  postFieldsForCrypto = 'title content _content_mentions type _posted_by created_date tags _assigned_to';

  async activateApprovalForItem(itemId: string, type: string, approval: boolean, userId: string) {
    try {
      if (type == 'file') {
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
                  description: '',
                  action: 'created',
                  approval_date: moment().format()
                }
              }
            })
          .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
          .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
          .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
          .populate({ path: '_group', select: 'custom_fields _workspace' })
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
                  description: '',
                  action: 'deleted',
                  approval_date: moment().format()
                }
              }
            })
          .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
          .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
          .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
          .populate({ path: '_group', select: 'custom_fields _workspace' })
          .lean();
        }
      } else if (type == 'post') {
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
                  description: '',
                  action: 'created',
                  approval_date: moment().format()
                }
              }
            })
          .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
          .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
          .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
          .populate({ path: '_group', select: 'custom_fields _workspace' })
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
                  description: '',
                  action: 'deleted',
                  approval_date: moment().format()
                }
              }
            })
          .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic' })
          .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
          .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
          .populate({ path: '_group', select: 'custom_fields _workspace' })
          .lean();
        }
      }
    } catch (err) {
      throw err;
    }
  };

  async addUserToFlow(itemId: string, type: string, userId: string) {
    try {
      if (type == 'file') {
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
          .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
          .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
          .populate({ path: '_group', select: 'custom_fields _workspace' })
          .lean();
      } else if (type == 'post') {
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
          .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
          .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
          .populate({ path: '_group', select: 'custom_fields _workspace' })
          .lean();
      }
    } catch (err) {
      throw err;
    }
  };

  async removeUserFromFlow(itemId: string, type: string, approvalId: string) {
    try {
      if (type == 'file') {
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
      } else if (type == 'post') {
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
      if (type == 'file') {
        const file : any = await this.launchFileApprovalFlow(itemId, approval_flow_launched, userId);

        // SEND NOTIFICATION TO ALL USERS IN THE FLOW TO INFORM THEY NEED TO REVIEW THE ITEM
        await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/launch-approval-flow`, {
            item: JSON.stringify(file),
            posted_by: userId,
          }, { maxContentLength: 60 * 1024 * 1024 }
        );

        return file;
      } else if (type == 'post') {
        const post : any = await this.launchPostApprovalFlow(itemId, approval_flow_launched, userId);

        // SEND NOTIFICATION TO ALL USERS IN THE FLOW TO INFORM THEY NEED TO REVIEW THE ITEM
        await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/launch-approval-flow`, {
            item: JSON.stringify(post),
            posted_by: userId,
          }, { maxContentLength: 60 * 1024 * 1024 }
        );

        return post;
      }
    } catch (err) {
      throw err;
    }
  };

  async launchFileApprovalFlow(itemId: string, approval_flow_launched: boolean, userId: string) {
    let file: any = await File.findById(
        { _id: itemId})
      .select(this.fileFieldsForCrypto)
      .lean();

    const approval_envelope = await this.encryptData(JSON.stringify(file));
    
    file = await File.findOneAndUpdate(
        { _id: itemId}, 
        {
          $set: {
            approval_flow_launched: approval_flow_launched || false,
            approval_envelope: approval_envelope
          },
          $push: {
            approval_history: {
              _actor: userId,
              description: '',
              action: 'launch',
              approval_date: moment().format()
            }
          }
        })
      .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic email' })
      .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
      .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
      .populate({ path: '_group', select: 'custom_fields _workspace' })
      .lean();

    return file;
  }

  async launchPostApprovalFlow(itemId: string, approval_flow_launched: boolean, userId: string) {
    let post: any = await Post.findById(
        { _id: itemId})
      .select(this.postFieldsForCrypto)
      .lean();

    const approval_envelope = await this.encryptData(JSON.stringify(post));
    
    post = await Post.findOneAndUpdate(
        { _id: itemId}, 
        {
          $set: {
            approval_flow_launched: approval_flow_launched || false,
            approval_envelope: approval_envelope
          },
          $push: {
            approval_history: {
              _actor: userId,
              description: '',
              action: 'launch',
              approval_date: moment().format()
            }
          }
        })
      .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic email' })
      .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
      .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
      .populate({ path: '_group', select: 'custom_fields _workspace' })
      .lean();

    return post;
  }

  async approveItem(itemId: string, type: string, approvalId: string) {
    try {
      if (type == 'file') {
        return await this.approveFile(itemId, approvalId);
      } else if (type == 'post') {
        return await this.approvePost(itemId, approvalId);
      }
    } catch (err) {
      throw err;
    }
  };

  async approveFile(itemId: string, approvalId: string) {
    const confirmationCode = await this.generateConfirmationCode();
    let item = await File.findOneAndUpdate(
      { _id: itemId }, 
      {
        $set: {
          "approval_flow.$[approval].confirmation_code": confirmationCode
        }
      },
      {
        arrayFilters: [{ "approval._id": approvalId }],
        new: true
      })
      .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic email' })
      .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
      .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
      .populate({ path: '_group', select: 'custom_fields _workspace' })
      .lean();

    // SEND EMAIL WITH CODE TO USER
    // Obtain the workspace for the api key for the email
    const workspace: any = await Workspace.findById({
      _id: item._group._workspace
    }).select('management_private_api_key').lean();

    // GET emal of the user to send the code
    const index = item.approval_flow.findIndex(approval => approval._id == approvalId);
    const user: any = item.approval_flow[index]._assigned_to;

    axios.post(`${process.env.MANAGEMENT_URL}/api/mail/approve-item-code`, {
      API_KEY: workspace['management_private_api_key'],
      user: user,
      code: confirmationCode,
      item: JSON.stringify(item)
    })
    .catch((err)=>{
      console.log(err);
      throw err;
    });

    return item;
  }

  async approvePost(itemId: string, approvalId: string) {
    const confirmationCode = await this.generateConfirmationCode();
    let item = await Post.findOneAndUpdate(
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
      .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic email' })
      .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
      .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
      .populate({ path: '_group', select: 'custom_fields _workspace' })
      .lean();

    // SEND EMAIL WITH CODE TO USER
    // Obtain the workspace for the api key for the email
    const workspace: any = await Workspace.findById({
      _id: item._group._workspace
    }).select('management_private_api_key').lean();
    
    // GET emal of the user to send the code
    const index = item.approval_flow.findIndex(approval => approval._id == approvalId);
    const user: any = item.approval_flow[index]._assigned_to;

    axios.post(`${process.env.MANAGEMENT_URL}/api/mail/approve-item-code`, {
      API_KEY: workspace['management_private_api_key'],
      user: user,
      code: confirmationCode,
      item: JSON.stringify(item)
    })
    .catch((err)=>{
      console.log(err);
      throw err;
    });

    return item;
  }

  async rejectItem(itemId: string, type: string, description: string, userId: string) {
    try {
      if (type == 'file') {
        const file: any = await File.findOneAndUpdate(
            { _id: itemId}, 
            {
              $set: {
                approval_flow: [],
                approval_flow_launched: false
              },
              $push: {
                approval_history: {
                  _actor: userId,
                  description: description,
                  action: 'rejected',
                  approval_date: moment().format()
                }
              }
            },
            {
              new: true
            })
          .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic email' })
          .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
          .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
          .populate({ path: '_group', select: 'custom_fields _workspace' })
          .lean();

        // SEND NOTIFICATION TO ALL USERS IN THE FLOW (INCLUDING CREATOR) TO INFORM THE ITEM WAS REJECTED
        await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/reject-item`, {
            item: JSON.stringify(file),
            rejected_by: userId,
          }, { maxContentLength: 60 * 1024 * 1024 }
        );

        return file;
      } else if (type == 'post') {
        const post: any = await Post.findOneAndUpdate(
            { _id: itemId}, 
            {
              $set: {
                approval_flow: [],
                approval_flow_launched: false
              },
              $push: {
                approval_history: {
                  _actor: userId,
                  description: description,
                  action: 'rejected',
                  approval_date: moment().format()
                }
              }
            },
            {
              new: true
            })
          .populate({ path: '_posted_by', select: '_id first_name last_name profile_pic email' })
          .populate({ path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' })
          .populate({ path: 'approval_history._actor', select: '_id first_name last_name profile_pic' })
          .populate({ path: '_group', select: 'custom_fields _workspace' })
          .lean();

        // SEND NOTIFICATION TO ALL USERS IN THE FLOW (INCLUDING CREATOR) TO INFORM THE ITEM WAS REJECTED
        await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/reject-item`, {
            item: JSON.stringify(post),
            rejected_by: userId,
          }, { maxContentLength: 60 * 1024 * 1024 }
        );

        return post;
      }
    } catch (err) {
      throw err;
    }
  };

  async confirmAction(itemId: string, type: string, approvalId: string, code: string, description: string, userId: string) {
    try {
      const itemCorrect = await this.confirmItemDidNotChange(itemId, type);

      if (itemCorrect) {
        if (type == 'file') {
          const fileDB: any = await File.findById({_id: itemId}).select('approval_flow').lean();
          let approvalFileIndex = await ((fileDB && fileDB.approval_flow) ? fileDB.approval_flow.findIndex(approval => approval._id == approvalId) : -1);
  
          if (approvalFileIndex >= 0) {
            if (fileDB.approval_flow[approvalFileIndex].confirmation_code == code) {
              const fileSignatureDate = moment().format();
              const fileCrypto: any = {
                approvalId: approvalId,
                itemId: itemId,
                userId: userId,
                approval_envelope: fileDB['approval_envelope'],
                code: code,
                fileSignatureDate: fileSignatureDate
              };
              const fileSignatureCode = await this.encryptData(JSON.stringify(fileCrypto));

              let file: any = await File.findOne({
                  _id: itemId
                });
              approvalFileIndex = await ((file && file.approval_flow) ? file.approval_flow.findIndex(approval => approval._id == approvalId) : -1);
              if (approvalFileIndex >= 0) {
                file.approval_flow[approvalFileIndex].signature_code = fileSignatureCode;
                file.approval_flow[approvalFileIndex].confirmation_date = fileSignatureDate;
                file.approval_flow[approvalFileIndex].description = description;
                file.approval_flow[approvalFileIndex].confirmed = true;

                file.approval_history.push({
                  _actor: userId,
                  description: description,
                  action: 'approved',
                  approval_date: moment().format()
                });
              }
              file.save();

              file = await File.populate(file, [
                { path: '_group', select: 'custom_fields _workspace' },
                { path: '_posted_by', select: '_id first_name last_name profile_pic' },
                { path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' },
                { path: 'approval_history._actor', select: '_id first_name last_name profile_pic' }
              ]);

              // IF ALL USERS APPROVED THE ITEM, SEND EMAIL & NOTIFICATION TO ALL USERS IN THE FLOW (INCLUDING CREATOR) TO INFORM THE ITEM WAS APPROVED
              let flowCompleted = true;
              if (file && file.approval_flow) {
                flowCompleted = await this.isApprovalFlowCompleted(file.approval_flow);
              } else  {
                flowCompleted = false;
              }
        
              if (flowCompleted) {
                await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/item-approved`, {
                    item: JSON.stringify(file)
                  }, { maxContentLength: 60 * 1024 * 1024 }
                );
              }
  
              return file;
            } else {
              throw new Error("The code inserted doesn't match the confirmation code.");
            }
          } else {
            throw new Error("There is no approval with the id provided.");
          }
        } else if (type == 'post') {
          const postDB: any = await Post.findById({_id: itemId}).select('approval_flow').lean();
          let approvalPostIndex = await ((postDB && postDB.approval_flow) ? postDB.approval_flow.findIndex(approval => approval._id == approvalId) : -1);
          if (approvalPostIndex >= 0) {
            if (postDB.approval_flow[approvalPostIndex].confirmation_code == code) {
              const postSignatureDate = moment().format();
              const postCrypto: any = {
                  approvalId: approvalId,
                  itemId: itemId,
                  userId: userId,
                  approval_envelope: postDB['approval_envelope'],
                  code: code,
                  postSignatureDate: postSignatureDate
                };
              const postSignatureCode = await this.encryptData(JSON.stringify(postCrypto));
              let post: any = await Post.findOne({
                  _id: itemId
                });
              approvalPostIndex = await ((post && post.approval_flow) ? post.approval_flow.findIndex(approval => approval._id == approvalId) : -1);
              if (approvalPostIndex >= 0) {
                post.approval_flow[approvalPostIndex].signature_code = postSignatureCode;
                post.approval_flow[approvalPostIndex].confirmation_date = postSignatureDate;
                post.approval_flow[approvalPostIndex].description = description;
                post.approval_flow[approvalPostIndex].confirmed = true;

                post.approval_history.push({
                  _actor: userId,
                  description: description,
                  action: 'approved',
                  approval_date: moment().format()
                });
              }

              post.save();

              post = await Post.populate(post, [
                { path: '_group', select: 'custom_fields _workspace' },
                { path: '_posted_by', select: '_id first_name last_name profile_pic' },
                { path: 'approval_flow._assigned_to', select: '_id first_name last_name profile_pic email' },
                { path: 'approval_history._actor', select: '_id first_name last_name profile_pic' }
              ]);
  
              // IF ALL USERS APPROVED THE ITEM, SEND EMAIL & NOTIFICATION TO ALL USERS IN THE FLOW (INCLUDING CREATOR) TO INFORM THE ITEM WAS APPROVED
              let flowCompleted = true;
              if (post && post.approval_flow) {
                flowCompleted = await this.isApprovalFlowCompleted(post.approval_flow);
              } else  {
                flowCompleted = false;
              }
        
              if (flowCompleted) {
                await http.post(`${process.env.NOTIFICATIONS_SERVER_API}/item-approved`, {
                    item: JSON.stringify(post)
                  }, { maxContentLength: 60 * 1024 * 1024 }
                );
              }
  
              return post;
            } else {
              throw new Error("The code inserted doesn't match the confirmation code.");
            }
          } else {
            throw new Error("There is no approval with the id provided.");
          }
        }
      } else {
        this.rejectItem(itemId, type, 'The item is corrupted and cannot be approved.', userId);
        throw new Error("The item is corrupted and cannot be approved.");
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

  isApprovalFlowCompleted(flow) {
    for (let i = 0; i < flow.length; i++) {
      if (!flow[i].confirmed || !flow[i].confirmation_date) {
        return false;
      }
    }
    return true
  }

  /**
   * This function encrypts the data which is associated with storageKey
   * Following CryptoJS Standard functions
   * @param data
   */
  encryptData(data: string) {
    return CryptoJS.SHA512(data).toString();
  }

  async confirmItemDidNotChange(itemId: string, type: string) {

    if (type == 'file') {
      let file: any = await File.findById(
        { _id: itemId})
      .select(this.fileFieldsForCrypto)
      .lean();
      
      const approval_envelope =  await this.encryptData(JSON.stringify(file));

      const fileEnvelope = await File.findById(
          { _id: itemId})
        .select('approval_envelope')
        .lean();

      if (fileEnvelope.approval_envelope == approval_envelope) {
        return true;
      }
    } else if (type == 'post') {
      let post: any = await Post.findById(
          { _id: itemId})
        .select(this.postFieldsForCrypto)
        .lean();

      const approval_envelope = await this.encryptData(JSON.stringify(post));
      const postEnvelope = await Post.findById(
          { _id: itemId})
        .select('approval_envelope')
        .lean();
      if (postEnvelope.approval_envelope == approval_envelope) {
        return true;
      }
    }

    return false;
  }
}
