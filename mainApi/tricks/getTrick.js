const AWS = require('aws-sdk');
const { getDynamo } = require('/opt/get-dynamo.js');
const { verifyUser } = require('/opt/verify-user.js');

exports.handler = async function(event, context, callback){
    let token = event.headers.Authorization
    let googleResponse
    try {
        googleResponse = await verifyUser(token)
    } catch (error) {
        console.log(error)
        return {
            "statusCode": 400,
            "body": JSON.stringify("could not verify user exists")
        }
    }

    if(!googleResponse.id) {
        return {
            "statusCode": 400,
            "body": JSON.stringify("could not verify user exists: No id present")
        }
    }


    let response = await getDynamo('TapTricks', 'trickName', event.queryStringParameters.trickName)
    return {
        "statusCode": 400,
        "body": JSON.stringify(response)
    }
}