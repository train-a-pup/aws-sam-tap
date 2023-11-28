const AWS = require('aws-sdk');
const { postDynamo } = require('/opt/post-dynamo.js');
const { getDynamo } = require('/opt/get-dynamo.js');
const axios = require("axios");
const { verifyUser } = require('/opt/verify-user.js');

exports.handler = async function(event, context, callback){
  console.log(event)
  let eventBody = JSON.parse(event.body)
  
  console.log(eventBody)

  if(!eventBody.breed) {
    return "BREED IS REQURIED"
  }

  if(!eventBody.dob) {
    return "Date Of Birth IS REQUIRED"
  }

  if(!eventBody.gender) {
    return "Gender IS REQUIRED"
  }
  let userId

  try {
    let googleResponse = await verifyUser(eventBody.token)
    userId = googleResponse.id
  } catch (error) {
    return JSON.stringify(error)
  }
  
  if(!userId)
    return "USERID REQUIRED"

  let user = {
    userId: userId,
    breed: eventBody.breed,
    dob: eventBody.dob,
    gender: eventBody.gender,
    name: eventBody.name,
    weight: eventBody.weight,
    events: {}
  }
  
  let existingUser = await getDynamo('user', 'userId', userId)
  if(JSON.parse(existingUser?.data)?.Items[0]?.events) {
    user.events = JSON.parse(existingUser.data).Items[0].events
  }
  
  console.log(user)
  let response = await postDynamo('user', user)

  return {
      "statusCode": 200,
      "body": JSON.stringify(response)
  }
}