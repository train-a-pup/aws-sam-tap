const aws = require('aws-sdk');
const { postNotification } = require('/opt/post-notification.js');

exports.handler = async function(event, body, callback){
  console.log("event is ", event)

  switch (event.type) {
    case 'userNotification':
      return postNotification(event)
    default:
      break;
  }
}