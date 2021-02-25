import { SlackService } from "../api/service"
import { Post, Comment, User } from "../api/models";

// Create Notifications controller class
const slackService = new SlackService()

/**
 * This function is responsible for generating the notifications feed
 * @param requestbody
 */
async function sendSlackNotification(data: any) {
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
            default:
                return "am here working";
        }

    } catch (err) {
        console.log('err', err);
    }
};

async function taskAssigned(data:any){
    
    console.log("data in side taskAssigned",data);

    const postData = await Post.findById(data.postId, (err, data) => {
        if(err){
        } else {
            return data;
        }
    });
    const userData = await User.findById(data.assigneeId, (err, data) => {
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
    const assignedToFullName = userData['full_name'];
    const postTitle = postData['title'];
    const groupId = postData['_group'];
     const comment_object = {
        name: assigneFromFullName,
        text: `${assigneFromFullName} assigned ${assignedToFullName} on post ${postTitle}`,
        image: assigneFromProfilePic,
        group_id:groupId,
        post_id: data.postId,
        content: '\n ',
        btn_title:'view task'
    }

    return comment_object;

}

async function statusChanged(data:any) {
    console.log("data in side statusChanged",data);
    const postData = await Post.findById(data.postId, { _group: 1, title: 1 });
    const userAssignedData = await User.findById(data.assigned_to, { full_name: 1 });
    const userData = await User.findById(data.userId, {full_name: 1, profile_pic: 1});
    const userFullName = userData['full_name'];
    const userProfilePic = userData['profile_pic'];
    const groupId = postData['_group'];
    const postTitle = postData['title'];
    var notification_text = '';
    if(data.assigned_to && userAssignedData){
        const userAssignedFullName = userAssignedData['full_name'];
        notification_text = `${userAssignedFullName}'s assignment status changed by ${userFullName} on post ${postTitle} `;
    } else {
        notification_text = `${postTitle} post status changed by ${userFullName}`;
    }
    const comment_object = {
        name: userFullName,
        text: notification_text,
        image: userProfilePic,
        content: '\n ',
        group_id: groupId,
        post_id: data.postId,
        btn_title:'view task'
    }

    return comment_object;
    
}

async function commented(data:any) {
    
    console.log("data in side commented",data);

    const postData = await Post.findById({ _id: data.postId }, { _group:1, title:1 });
    const userData = await User.findById({_id: data.commented_by}, {full_name:1, profile_pic:1});
    const postUserData = await User.findById({_id: data.posted_by}, {full_name:1});

    const groupId = postData['_group'];
    const title = postData['title'];
    const postUserFullName = postUserData['full_name'];
    const userFullName = userData['full_name'];
    const userProfilePic = userData['profile_pic'];
    const comment_object = {
        name: userFullName,
        text: `${userFullName} commented on ${postUserFullName}'s ${title}`,
        image: userProfilePic,
        content: '\n ',
        group_id: groupId,
        post_id: data.postId,
        btn_title:'view comment'
    }

    return comment_object;
}

async function followPost(data:any) {
    
    console.log("data in side commented",data);
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
    const postUserData = await User.findById(data.posted_by, (err, data) => {
        if(err){
        } else {
            return data;
        }
    });

    const postUserFullName = postUserData['full_name'];

    const postTitle = postData['title'];
    const groupId = postData['_group'];
    const followerName = userData['full_name'];
    const profile_img = userData['profile_pic'];

    const comment_object = {
        name: followerName,
        text: `${followerName} follows ${postUserFullName}'s post ${postTitle} `,
        image: profile_img,
        content: '\n ',
        group_id: groupId,
        post_id: data.postId,
        btn_title:'view post'
    }

    return comment_object;
}

async function likePost(data:any) {
    console.log("data in side likePost",data);

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

    const comment_object = {
        name: userObject.full_name,
        text: `${userObject.full_name} likes ${postUserFullName}'s post ${postObject.title}`,
        image: userObject.profile_pic,
        content: '\n ',
        group_id: postObject._group,
        post_id: data.postId,
        btn_title:'view post'
    }

    return comment_object;

}

async function likeComment(data:any) {
    console.log("data in side likeComment",data);

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
    const comment_object = {
        name: userFullName,
        text: `${userFullName} likes ${commentedByUserFullName}'s comment on ${postTitle}`,
        image: profile_pic,
        content: '\n ',
        groupId: groupId,
        post_id: data.postId,
        btn_title:'view post'
    }

    return comment_object;

}

/*  =======================
 *  --  HELPER FUNCTIONS --
 *  =======================
 * */
export {

    // send Slack Notification
    sendSlackNotification,

}