import http from 'axios';
import moment from 'moment';
import { Chat, Group, Message } from '../models';
import { sendErr } from '../utils/sendError';

/*  ===============================
 *  -- CHATS Service --
 *  ===============================
 */
export class ChatService {

  // Select User Fields on population
  userFields: any = 'first_name last_name profile_pic role email';

  // Select Group Fileds on population
  groupFields: any = 'group_name group_avatar workspace_name';

  chatFields: any = 'archived members';
  messageFields: any = 'posted_on content edited';

  private arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    // Please note that calling sort on an array will modify that array.
    // you might want to clone your array first.

    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  /**
   * This function is responsible for creating a new chat
   * @param chatData
   */
  async createChat(chatData: any, userId: string) {
    try {
      // Parse the String to JSON Object
      chatData = JSON.parse(chatData);

      let userChats = await Chat.find({
        'members._user': userId,
      }).select('members').lean();
      /*
      let userChats = await Chat.find({
        members: {
            $elementMatch: {
                _user: userId
              }
          },
      }).select('members').lean();
      
      db.chats.find({
        'member': {
          $elemMatch: {
            _user: ObjectId("5f2d00bcadc9b8004b4dc481")
          }
        }
      })
      db.chats.find({ 'members._user': ObjectId("5f2d00bcadc9b8004b4dc481")})
      */
      let members = chatData?.members;
      members = await members?.filter((member, index) => {
          return (members?.findIndex(m => m._user._id == member._user._id) == index);
        })
        .sort((m1, m2) => (m1._user._id > m2._user._id) ? 1 : -1)
        .map(m => m._user._id || m._user);

      let chatExists = false;
      let existingChatId = '';
      for (let i = 0; i < userChats.length && !chatExists; i++) {
        let dbMembers = userChats[i]?.members;
        dbMembers = await dbMembers?.filter((member, index) => {
            return (dbMembers?.findIndex(m => m._user._id == member._user._id) == index);
          })
          .sort((m1, m2) => (m1._user._id > m2._user._id) ? 1 : -1)
          .map(m => m._user._id || m._user);

        if (this.arraysEqual(members, dbMembers)) {
          chatExists = true;
          existingChatId = userChats[0]._id;
        }
console.log({dbMembers});
      }
console.log({members});
console.log({chatExists});
console.log({existingChatId});
      let chat: any;
      if (!chatExists) {
console.log("1111111");
        // Create new chat
        chat = await Chat.create(chatData);
      } else {
console.log("2222222");
        chat = await Chat.findOneAndUpdate({
          _id: existingChatId
        }, {
          archived: false
        }, {
          new: true
        });
      }

      chat = await Chat.findOneAndUpdate({
          _id: chat._id
        }, {
          archived: false
        }, {
          new: true
        })
        .select(this.chatFields)
        .populate({ path: '_group', select: this.groupFields })
        .populate({ path: 'members._user', select: this.userFields })
        .lean();
console.log({chat});
      // Return Chat Object
      return {chat: chat, newChat: !chatExists};
    } catch (err) {

      // Return with error
      throw (err);
    }
  }

  /**
   * This function is responsible for retrieving a chat
   * @param chatId
   */
  async get(chatId: any) {

    return await Chat.findOne({ _id: chatId })
      .select(this.chatFields)
      .populate({ path: '_group', select: this.groupFields })
      .populate({ path: 'members._user', select: this.userFields })
      .lean();
  }

  /**
   * This function is responsible for retrieving the direct chats
   * @param userId
   */
  async getDirectChats(userId: any) {

    return await Chat.find({
        $and: [
          { 'members._user': userId },
          { archived: false }
        ]
      })
      .select(this.chatFields)
      .populate({ path: '_group', select: this.groupFields })
      .populate({ path: 'members._user', select: this.userFields })
      .lean();
  }

  /**
   * This function is responsible for retrieving the group chats
   * @param userId
   */
  async getGroupChats(userId: any) {
    const userGroups = await Group.find({
        $and: [
            { group_name: { $ne: 'personal' } },
            { group_name: { $ne: 'private' } },
            { $or: [{ _members: userId }, { _admins: userId }] },
            { $or: [{ archived_group: false }, { archived_group: { $eq: null }}]}
        ]
      }).select('_id').lean();

    let groupChats = [];
    for (let i = 0; i < userGroups.length; i++) {
      let groupChat = await Chat.findOne({
          '_group': userGroups[i]._id
        })
        .select(this.chatFields)
        .populate({ path: '_group', select: this.groupFields })
        .populate({ path: 'members._user', select: this.userFields })
        .lean();

      if (!groupChat) {
        let newChat = {
          _group: userGroups[i]._id,
          archived: false
        };

        groupChat = await Chat.create(newChat);

        groupChat._group = userGroups[i];
      }

      if (groupChat) {
        groupChats.push(groupChat);
      }
    }

      return groupChats;
  }

  /**
   * This function is responsible for changing the task assignee
   * @param chatId
   * @param assigneeId
   */
  async addMember(chatId: string, memberId: string, userId: string) {

    try {

      // Get chat data
      var chat: any = await Chat.findOneAndUpdate({
          _id: chatId
        }, {
          $addToSet: { members: {
            _user: memberId,
            joined_on: moment().format(),
            is_admin: false
          } }
        }, {
          new: true
        })
        .select(this.chatFields)
        .populate({ path: '_group', select: this.groupFields })
        .populate({ path: 'members._user', select: this.userFields })
        .lean();

      // Create Real time Notification to notify user about the task reassignment
      http.post(`${process.env.NOTIFICATIONS_SERVER_API}/chat-add-member`, {
          chatId: chat._id,
          memberId: memberId,
          _assigned_from: userId
        }).catch(err => {
          console.log(`\n⛔️ Error:\n ${err}`);
        });

      // Return the chat
      return chat;

    } catch (err) {
      throw (err);
    }
  }

  /**
   * This function is responsible for changing the task assignee
   * @param chatId
   * @param memberId
   */
  async removeMember(chatId: string, memberId: string, userId: string) {

    try {
      let chat: any = await Chat.findOne({
          _id: chatId
        })
        .select(this.chatFields)
        .populate({ path: 'members._user', select: '_id' })
        .lean();

      let members = chat.members;
      members = await members?.filter((member) => {
          return member._user._id != memberId;
        });

      // Update chat
      chat = await Chat.findOneAndUpdate({
          _id: chatId
        }, {
          members: members
        }, {
          new: true
        })
        .select(this.chatFields)
        .populate({ path: '_group', select: this.groupFields })
        .populate({ path: 'members._user', select: this.userFields })
        .lean();

      // Return the chat
      return chat;

    } catch (err) {
      throw (err);
    }
  }

  /**
   * This function is responsible for changing the task assignee
   * @param chatId
   * @param assigneeId
   */
  async archiveChat(chatId: string) {

    try {
      // Get chat data
      let chat: any = await Chat.findById({
          _id: chatId
        }).select('archived').lean();

      chat = await Chat.findByIdAndUpdate({
          _id: chatId
        }, {
          archived: !chat.archived
        }, {
          new: true
        })
        .select(this.chatFields)
        .populate({ path: '_group', select: this.groupFields })
        .populate({ path: 'members._user', select: this.userFields })
        .lean();

      // Return the chat
      return chat;

    } catch (err) {
      throw (err);
    }
  }

  /**
   * This function is responsible for changing the task assignee
   * @param chatId
   * @param assigneeId
   */
  async sendMessage(newMessage: any) {

    try {
console.log({newMessage});
      let message: any = await Message.create(newMessage);

      this.sendNotification(message._chat._id || message._chat, message._id);
    } catch (err) {
      throw (err);
    }
  }

  /**
   * This service is responsible for fetching recent 5 posts based on the @lastPostId and @groupId
   * @param groupId
   * @param lastPostId
   */
  async getMessages(chatId: any, lastMessageId: any, userId: string) {

    try {
      var messages = [];

      const chat: any = await Chat.findOne({ _id: chatId }).select('members').lean();
console.log({chat});
console.log({userId})
      const memberIndex = (chat.members) ? chat.members.findIndex(m => (m._id || m) == userId) : -1;
      const member = (memberIndex >= 0) ? chat.members[memberIndex] : null;
console.log({member});
console.log({memberIndex});
      if (!member) {
        throw new Error('The user is not part of the chat.');
      }

      // Fetch posts on the basis of the params @lastPostId
      if (lastMessageId) {
console.log({lastMessageId});
        messages = await Message.find({
            $and: [
                { _chat: chatId },
                { _id: { $lt: lastMessageId } },
                { posted_on: { $lt: member.joined_on }}
              ]
          })
          .sort('-_id')
          .limit(10)
          .select(this.messageFields)
          .populate({ path: '_posted_by', select: this.userFields })
          .populate({ path: '_content_mentions', select: this.userFields })
          .populate({ path: '_chat', select: '_id' })
          .lean();
      }
      else {
console.log('aaaaaaaa');
        messages = await Message.find({
            $and: [
                { _chat: chatId },
                { posted_on: { $lt: member.joined_on }}
              ]
          })
          .sort('-_id')
          .limit(10)
          .select(this.messageFields)
          .populate({ path: '_posted_by', select: this.userFields })
          .populate({ path: '_content_mentions', select: this.userFields })
          .populate({ path: '_chat', select: '_id' })
          .lean();
      }
console.log({messages});
      // Return set of posts
      return messages;

    } catch (err) {

      // Return With error
      throw (err);
    }
  }

  /**
   * This function is responsible for sending the related real time notifications to the user(s)
   * @param chat
   */
  async sendNotification(chatId: string, messageId: string) {
    return http.post(`${process.env.NOTIFICATIONS_SERVER_API}/new-chat-message`, {
        chatId: chatId,
        messageId: messageId
      }).catch(err => {
        console.log(`\n⛔️ Error:\n ${err}`);
      });
  }
}
