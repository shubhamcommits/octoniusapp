/**
 * This function generates production ready link
 * @param linkType 
 * @param urlParam 
 */
const generateLink = (linkType: any, urlParam = null) => {
    return `${process.env.PROTOCOL}://${process.env.DOMAIN}/#/${linkType}${urlParam ? `?workplace=${urlParam}` : ''}`;
};

/**
 * This function gives us the post link to the production server
 * @param groupId 
 * @param postId 
 */
const postLink = (groupId: string, postId: string) => (`${process.env.PROTOCOL}://${process.env.DOMAIN}/#/dashboard/group/${groupId}/post/${postId}`);


export = {
    fromEmail: 'dev@octonius.com',
    fromName: 'Team Octonius',
    replyToEmail: 'support@octonius.com',
    replyToName: 'Support',
    signupLink(urlParam = null) {
        return generateLink('signup', urlParam);
    },
    groupOnlyLink(group = null, workplace = null){
        return `${process.env.PROTOCOL}://${process.env.DOMAIN}/#/signup${group ? `?group=${group}` : ''}${workplace ? `?group=${workplace}` : ''}`;
    },
    signinLink: generateLink('signin'),
    resetPwdLink: generateLink('resetPassword'),
    postLink
};
