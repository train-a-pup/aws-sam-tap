const AWS = require('aws-sdk');
const axios = require("axios");
const { updateDynamo } = require('/opt/update-dynamo.js');
const { getDynamo } = require('/opt/get-dynamo.js');
const { verifyUser } = require('/opt/verify-user.js');
const { invokeStepFunction } = require('/opt/invokeStepFunction.js');

module.exports.postNotification = async function postNotification(payload){
  let eventBody = payload

  let eventId = payload.functionParams.eventId
  let user = payload.functionParams.user
  let userId = user.userId
  let events = user.events
  let event = events[eventId]
  let pushToken = user.pushToken


  await updateDynamo('user', userId, user.breed, payload.dueDate, ['events', eventId, 'dueDate'], '#notif.#notificationId.#dueDate')
  title = event.title
  bodyText = event.body

  if(pushToken) {
    try {
      let response = await axios.post('https://api.expo.dev/v2/push/send', [{
        to: pushToken,
        title: title,
        body: bodyText
      }], {
        headers: {
          authorization: "Bearer BEARER_TOKEN_EXPO"
        }
      })    
    } catch (error) {
      return `cannot send push token ${JSON.stringify(error)}`
    }
  }

  let newScheduleDate
  let oldDate = event.dueDate 
  if (event.repeats === 'yearly') {
    newScheduleDate = new Date(oldDate).setFullYear(new Date(oldDate).getFullYear() + 1)
  } else if(event.repeats === 'mothly') {
    const date = new Date(oldDate)
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();
  
    // Calculate the month and year for the new date
    let newMonth = currentMonth + 1;
    let newYear = currentYear;
  
    if (newMonth > 11) {
      // If the new month is greater than 11 (December), wrap around to January of the next year
      newMonth = 0;
      newYear++;
    }
  
    // Set the date to the first day of the new month
    const newDate = new Date(newYear, newMonth, 1);
  
    // Subtract one day to get the last day of the previous month
    newDate.setDate(date.getDate());
  
    // If the original date was the last day of the month, adjust the new date accordingly
    if (date.getDate() === new Date(newDate.getFullYear(), newDate.getMonth(), 0).getDate()) {
      const lastDayOfNewMonth = newDate.getDate();
      newDate.setDate(Math.min(lastDayOfNewMonth, date.getDate()));
    }
  
    newDate.setTime(date.getTime())
      
    newScheduleDate = newDate
  } else if(event.repeats === 'weekly') {
    newScheduleDate = new Date(oldDate).setDate(new Date(oldDate).getDate() + 7)
  } else if(event.repeats === 'daily') {
    newScheduleDate = new Date(oldDate).setDate(new Date(oldDate).getDate() + 1)
  } else if(event.repeats === 'never') {
    return "never chosen"
  } else {
    return "nothing chosen"
  }

  try {
    response = await invokeStepFunction({
      type: 'userNotification',
      dueDate: new Date(newDate).toISOString(),
      functionParams: {
        user,
        eventId,
      }
    })
  } catch (error) {
    return "error scheduling new user notification"
  }

  let cache = [];
  return JSON.stringify(response, function(key, value) {
    if (typeof value === "object" && value !== null) {
      if (cache.indexOf(value) !== -1) {
        return;
      }
      cache.push(value);
    }
    return value;
  })
}
