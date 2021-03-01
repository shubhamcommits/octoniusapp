/**
 * This function generates production ready link
 * @param linkType 
 * @param urlParam 
 */
const generateLink = (linkType: any, urlParam = null) => {
    return `${process.env.PROTOCOL}://${process.env.DOMAIN}/${linkType}${urlParam ? `?workplace=${urlParam}` : ''}`;
};

/**
 * This function gives us the post link to the production server
 * @param groupId 
 * @param postId 
 */
const postLink = (groupId: string, postId: string) => (`${process.env.PROTOCOL}://${process.env.DOMAIN}/dashboard/work/group/${groupId}/post/${postId}`);


export = {
    fromEmail: 'dev@octonius.com',
    fromName: 'Team Octonius',
    replyToEmail: 'support@octonius.com',
    replyToName: 'Support',
    signupLink(email) {
        return `${process.env.PROTOCOL}://${process.env.DOMAIN}/authentication/sign-up${email ? `?email=${email}` : ''}`;
    },
    signinLink: generateLink('signin'),
    resetPwdLink: generateLink('authentication/reset-password'),
    postLink
};
