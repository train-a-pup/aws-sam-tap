const AWS = require('aws-sdk');
const { scanDynamo } = require('/opt/scan-dynamo');
const { verifyUser } = require('/opt/verify-user.js');

//change this to get all the tricks we have, maybe paginate?
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
            "body": JSON.stringify("could not verify user exists")
        }
    }

    let response = await scanDynamo('TapTricksMenus')
    return {
        "statusCode": 400,
        "body": JSON.stringify(response)
    }
}