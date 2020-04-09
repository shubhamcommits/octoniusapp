/**
 * This function generates production ready link
 * @param linkType 
 * @param urlParam 
 */
const generateLink = (linkType: any, urlParam = null) => {
    return `https://workplace.octonius.com/#/${linkType}${urlParam ? `?workplace=${urlParam}` : ''}`;
};

/**
 * This function gives us the post link to the production server
 * @param groupId 
 * @param postId 
 */
const postLink = (groupId: string, postId: string) => (`https://workplace.octonius.com/#/dashboard/group/${groupId}/post/${postId}`);


export = {
    fromEmail: 'dev@octonius.com',
    fromName: 'Team Octonius',
    replyToEmail: 'support@octonius.com',
    replyToName: 'Support',
    signupLink(urlParam = null) {
        return generateLink('signup', urlParam);
    },
    groupOnlyLink(urlParam = null){
        return `https://workplace.octonius.com/#/signup${urlParam ? `?group=${urlParam}` : ''}`;
    },
    signinLink: generateLink('signin'),
    resetPwdLink: generateLink('resetPassword'),
    postLink
};
