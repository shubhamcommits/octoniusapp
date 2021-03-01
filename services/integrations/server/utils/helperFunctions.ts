import { IntegrationService } from "../api/service"
import { Post, Comment, User } from "../api/models";

// Create Notifications controller class
const integrationService = new IntegrationService()

/**
 * This function is responsible for generating the notifications Object
 * @param requestbody
 */
async function parsedNotificationData(data: any) {
    try {
        const type = data?.type;

        switch(type){
            case 'TASKASSIGNED':
                return await taskAssigned(data);
            case 'STATUSCHANGED':
                return await statusChanged(data);
            case 'COMMENTED':
                return await commented(data);
            case 'FOLLOW':
                return await followPost(data);
            case 'LIKE':
                return await likePost(data);
            case 'LIKECOMMENT':
                return await likeComment(data);
            case 'POSTMENTION':
                return await postMention(data);
            case 'COMMENTMENTION':
                return await commentMention(data);
            default:
                return "am here working";
        }

    } catch (err) {
        console.log('err', err);
    }
};

async function taskAssigned(data:any){

    const postData = await Post.findById(data.postId, (err, data) => {
        if(err){
        } else {
            return data;
        }
    });

    const assigneeFromData = await User.findById(data._assigned_from, (err, data) => {
        if(err){
        } else {
            return data;
        }
    });

    const assigneFromFullName = assigneeFromData['full_name'];
    const assigneFromProfilePic = assigneeFromData['profile_pic'];
    const postTitle = postData['title'];
    const groupId = postData['_group'];
     
    const notificationObject = {
        name: assigneFromFullName,
        text: `${assigneFromFullName} assigned you on ${postTitle}`,
        image: assigneFromProfilePic,
        group_id:groupId,
        post_id: data.postId,
        content: '\n ',
        btn_title:'view task'
    }

    return notificationObject;

}

async function statusChanged(data:any) {
    
    const postData = await Post.findById(data.postId, { _group: 1, title: 1 });
    const userAssignedData = await User.findById(data?.assigned_to?._id, { full_name: 1 });
    const userData = await User.findById(data.userId, {full_name: 1, profile_pic: 1});
    const userFullName = userData['full_name'];
    const userProfilePic = userData['profile_pic'];
    const groupId = postData['_group'];
    const postTitle = postData['title'];
    
    var notification_text = '';
    
    if(data.assigned_to && userAssignedData){
        notification_text = `${userFullName} changed status for ${postTitle} `;
    } else {
        notification_text = `${userFullName} changed status for ${postTitle}`;
    }
    const notificationObject = {
        name: userFullName,
        text: notification_text,
        image: userProfilePic,
        content: '\n ',
        group_id: groupId,
        post_id: data.postId,
        btn_title:'view task'
    }

    return notificationObject;
    
}

async function commented(data:any) {
    

    const postData = await Post.findById({ _id: data.postId }, { _group:1, title:1 });
    const userData = await User.findById({_id: data.commented_by}, {full_name:1, profile_pic:1});
    const postUserData = await User.findById({_id: data.posted_by}, {full_name:1});

    const groupId = postData['_group'];
    const title = postData['title'];
    const postUserFullName = postUserData['full_name'];
    const userFullName = userData['full_name'];
    const userProfilePic = userData['profile_pic'];
    
    const notificationObject = {
        name: userFullName,
        text: `${userFullName} commented on ${postUserFullName}'s ${title}`,
        image: userProfilePic,
        content: '\n ',
        group_id: groupId,
        post_id: data.postId,
        btn_title:'view comment'
    }

    return notificationObject;
}

async function followPost(data:any) {
    
    const postData = await Post.findById(data.postId, (err, data) => {
        if(err){
        } else {
            return data;
        }
    });
    const userData = await User.findById(data.follower, (err, data) => {
        if(err){
        } else {
            return data;
        }
    });
    
    const postTitle = postData['title'];
    const groupId = postData['_group'];
    const followerName = userData['full_name'];
    const profile_img = userData['profile_pic'];

    const notificationObject = {
        name: followerName,
        text: `${followerName} is following ${postTitle} `,
        image: profile_img,
        content: '\n ',
        group_id: groupId,
        post_id: data.postId,
        btn_title:'view post'
    }

    return notificationObject;
}

async function likePost(data:any) {

    const postData = await Post.findById(data.postId, (err, data) => {
        if(err){
        } else {
            return data;
        }
    });
    const userData = await User.findById(data.user, (err, data) => {
        if(err){
        } else {
            return data;
        }
    });
    const postUserData = await User.findById(data.posted_by, (err, data) => {
        if(err){
        } else {
            return data;
        }
    });

    const postUserFullName = postUserData['full_name'];
    const postObject = postData.toObject();

    const userObject = userData.toObject();

    const notificationObject = {
        name: userObject.full_name,
        text: `${userObject.full_name} likes ${postUserFullName}'s ${postObject.title}`,
        image: userObject.profile_pic,
        content: '\n ',
        group_id: postObject._group,
        post_id: data.postId,
        btn_title:'view post'
    }

    return notificationObject;

}

async function likeComment(data:any) {

    const postData = await Post.findById(data.postId, (err, data) => {
        if(err){
        } else {
            return data;
        }
    });
    const userData = await User.findById(data.user, (err, data) => {
        if(err){
        } else {
            return data;
        }
    });
    const commentedByUser = await User.findById(data.comment._commented_by, (err, data) => {
        if(err){
        } else {
            return data;
        }
    });
    const postTitle = postData['title'];
    const groupId = postData['_group'];
    const userFullName = userData['full_name'];
    const commentedByUserFullName = commentedByUser['full_name'];
    const profile_pic = userData['profile_pic'];
    
    const notificationObject = {
        name: userFullName,
        text: `${userFullName} likes ${commentedByUserFullName}'s comment on ${postTitle}`,
        image: profile_pic,
        content: '\n ',
        groupId: groupId,
        post_id: data.postId,
        btn_title:'view post'
    }

    return notificationObject;

}

async function postMention(data:any) {


    const postData = await Post.findById(data.postId, (err, data) => {
        if(err){
        } else {
            return data;
        }
    });
    
    const assigneFromFullName = data.posted_by.first_name+' '+data.posted_by.last_name;
    const assigneFromProfilePic = data.posted_by.profile_pic;
    const postTitle = postData['title'];
    const groupId = postData['_group'];
     
    const notificationObject = {
        name: assigneFromFullName,
        text: `${assigneFromFullName} mentioned ${data.mentioned_all?'all':'you'} in ${postTitle}`,
        image: assigneFromProfilePic,
        group_id:groupId,
        post_id: data.postId,
        content: '\n ',
        btn_title:'view task'
    }

    return notificationObject;
}

async function commentMention(data:any) {
    
    const commented_by_id = data.comment._commented_by;
    const groupId = data.comment._post._group._id;
    
    const userData = await User.findById(commented_by_id, (err, data) => {
        if(err){
        } else {
            return data;
        }
    });

    const postData = await Post.findById(data.comment._post._id, (err, data) => {
        if(err){
        } else {
            return data;
        }
    });

    const commented_by = userData['full_name'];
    const commented_by_profile_pic = userData['profile_pic'];
    const postTitle = postData['title'];
    
    const notificationObject = {
        name: commented_by,
        text: `${commented_by} mentioned ${data.comment._content_mentions.includes('all')?'all':'you'} in a comment to ${postTitle}`,
        image: commented_by_profile_pic,
        content: '\n',
        group_id: groupId,
        post_id: data.comment._post._id,
        btn_title:'view comment'
    }    

    return notificationObject;
}

/*  =======================
 *  --  HELPER FUNCTIONS --
 *  =======================
 * */
export {

    // parsed Notification data
    parsedNotificationData,

}