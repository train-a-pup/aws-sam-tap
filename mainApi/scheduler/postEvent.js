const aws = require('aws-sdk');
const { verifyUser } = require('/opt/verify-user.js');
const { updateDynamo } = require('/opt/update-dynamo.js');
const { invokeStepFunction } = require('/opt/invokeStepFunction.js')
const { getDynamo } = require('/opt/get-dynamo.js');

exports.handler = async function(event, context, callback){
  let eventBody = (event.body)
  eventBody = JSON.parse(eventBody)
  let userId
  let user
  let response
  let eventId
  try {
    let googleResponse = await verifyUser(eventBody.token)
    userId = googleResponse.id
  } catch (error) {
    return JSON.stringify(error)
  }

  try {
    user = await getDynamo('user', 'userId', userId)
    user = JSON.parse(user.data).Items[0]
  } catch (error) {
    console.log("error is ", JSON.stringify(error))
    return "Error fetching user."
  }

  try {
    eventId = generate_uuidv4()
    let dynamoResponse = await updateDynamo('user', userId, user.breed, {
        "title": eventBody.title,
        "body": eventBody.body,
        "date": eventBody.date,
        "repeats": eventBody.repeats
    }, ['events', eventId], '#event.#eventId')

    if(dynamoResponse.responseCode === 400) {
      console.log(dynamoResponse)
      throw new Error('Event Cannot Be Stored')
    }
  } catch (error) {
    console.log(error)
    return "Event cannot be stored."
  }

  try {
    if (eventBody.pushToken) {
      let response = await updateDynamo('user', userId, user.breed, eventBody.pushToken, ['pushToken'], '#push')
      if(response.responseCode === 400) {
        console.log('error saving push token.')
        return 'error saving push token.'
      }
      user.pushToken = eventBody.pushToken
    }
  } catch (error) {
    return "Push Token could not be stored user will not recieve notifications."
  }

  try {
    user = await getDynamo('user', 'userId', userId)
    user = JSON.parse(user.data).Items[0]
  } catch (error) {
    console.log("error is ", JSON.stringify(error))
    return "Error fetching user."
  }

  try {
    response = await invokeStepFunction({
      type: 'userNotification',
      dueDate: new Date(eventBody.date).toISOString(),
      functionParams: {
        user,
        eventId
      }
    })
  } catch (error) {
    console.log(error)
    return "Event will not have a notification."
  }

  return {
      "statusCode": 200,
      "body": JSON.stringify(response)
  }
}

function generate_uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
  function(c) {
     var uuid = Math.random() * 16 | 0, v = c == 'x' ? uuid : (uuid & 0x3 | 0x8);
     return uuid.toString(16);
  });
}