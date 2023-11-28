const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();

module.exports.getDynamo = async function getDynamo(table, searchParameter, searchValue){
    let scanningParameters = {
      TableName: table,
      KeyConditionExpression: `${searchParameter} = :i`,
      ExpressionAttributeValues: {
        ':i': searchValue
      }
    };

    let response = null
    await documentClient.query(scanningParameters).promise()
      .then((data) => {
        response = {responseCode: 200, data: JSON.stringify(data)};
      })
      .catch((error) => {
        response = {responseCode: 400, data: JSON.stringify({}), error: JSON.stringify(error)};
      })
    return response
}