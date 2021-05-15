/* eslint-disable global-require */

export default {
  checkDelay: require('./checkDelay').default,
  checkMessage: require('./checkMessage').default,
  checkChallenge: require('./checkChallenge').default,
  checkInterview: require('./checkInterview').default,

  pause: require('./pause').default,
  remove: require('./remove').default,
  repost: require('./repost').default,
  send2messages: require('./send2messages').default,

  reply: require('./reply').default,
  forwardMessage: require('./forwardMessage').default,
  copyMessage: require('./copyMessage').default,
  sendMessage: require('./sendMessage').default,
  replyInterview: require('./replyInterview').default,

  findMessage: require('./findMessage').default,

  messageTrim: require('./messageTrim').default,
  messageAppend: require('./messageAppend').default,
};
