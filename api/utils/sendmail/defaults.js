const generateLink = (linkType, urlParam = null) => {
  //removed for docker since it is in dev mode
  //(process.env.NODE_ENV || 'development') === 'development' ? `http://localhost:4200/#/${linkType}` :
  return `https://workplace.octonius.com/#/${linkType}${urlParam ? `?workplace=${urlParam}` : ''}`;
};

// http://localhost:4200/#/dashboard/group/5c292db763deb43d9434f660/post/5c2931b3a73ac7136437523d

  //removed (process.env.NODE_ENV === 'development'
  // ? `http://localhost:4200/#/dashboard/group/${groupId}/post/${postId}`
  // : `https://workplace.octonius.com/#/dashboard/group/${groupId}/post/${postId}`)

const postLink = (groupId, postId) => (`https://workplace.octonius.com/#/dashboard/group/${groupId}/post/${postId}`);




module.exports = {
  fromEmail: 'dev@octonius.com',
  fromName: 'Team Octonius',
  replyToEmail: 'support@octonius.com',
  replyToMail: 'Support',
  signupLink(urlParam = null) {
    return generateLink('signup', urlParam);
  },
  signinLink: generateLink('signin'),
  resetPwdLink: generateLink('resetPassword'),
  postLink
};
