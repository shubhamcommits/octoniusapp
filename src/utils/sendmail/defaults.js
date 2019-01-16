const generateLink = linkType => (process.env.NODE_ENV === 'development'
  ? `http://localhost:4200/#/${linkType}`
  : `https://workplace.octonius.com/#/${linkType}`);

// http://localhost:4200/#/dashboard/group/5c292db763deb43d9434f660/post/5c2931b3a73ac7136437523d

const postLink = (groupId, postId) => (process.env.NODE_ENV === 'development'
    ? `http://localhost:4200/#/dashboard/group/${groupId}/post/${postId}`
    : `https://workplace.octonius.com/#/dashboard/group/${groupId}/post/${postId}`);

module.exports = {
  fromEmail: 'dev@octonius.com',
  fromName: 'Team Octonius',
  replyToEmail: 'support@octonius.com',
  replyToMail: 'Support',
  signupLink: generateLink('signup'),
  signinLink: generateLink('signin'),
    postLink
};
