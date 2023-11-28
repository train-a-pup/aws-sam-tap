const AWS = require('aws-sdk');
const { postDynamo } = require('/opt/post-dynamo.js');
const { getDynamo } = require('/opt/get-dynamo.js');
const axios = require("axios");
const { verifyUser } = require('/opt/verify-user.js');
var documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async function(event, context, callback){
  console.log(event)
  let eventBody = JSON.parse(event.body)

  let response = null
  let userId
  let user = {
    userId: userId,
  }

  
  try {
    let googleResponse = await verifyUser(eventBody.token)
    userId = googleResponse.id
  } catch (error) {
    return JSON.stringify(error)
  }
  
  let existingUser = await getDynamo('user', 'userId', userId)
  if(JSON.parse(existingUser?.data)?.Items[0]?.events) {
    user.events = JSON.parse(existingUser.data).Items[0].events
  }

  if(!userId)
    return "USERID REQUIRED"

  var params  = {
    TableName: 'user',
    Item: user
  };

  await documentClient.delete(params).promise()
    .then((data) => {
      response = {responseCode: 200, data: JSON.stringify(data)};
    })
    .catch((error) => {
      response = {responseCode: 400, data: JSON.stringify({}), error: JSON.stringify(error)};
    })
  return response

}