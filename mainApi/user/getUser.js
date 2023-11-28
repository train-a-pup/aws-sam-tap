const AWS = require('aws-sdk');
const { getDynamo } = require('/opt/get-dynamo.js');
const { verifyUser } = require('/opt/verify-user.js');

exports.handler = async function(event, body, callback){
    console.log(getDynamo)
    let token = event.headers.Authorization

    let userId
    console.log(token)
    try {
        let googleResponse = await verifyUser(token)
        userId = googleResponse.id
        console.log('user verifed')
    } catch (error) {
        console.log(error)
        return {
            "statusCode": 400,
            "body": JSON.stringify("could not verify user exists")
        }
    }

    let response = await getDynamo('user', 'userId', userId)
    
    console.log(response)
    
    return {
        "statusCode": 200,
        "body": JSON.stringify(response)
    }
}