const AWS = require('aws-sdk');
var documentClient = new AWS.DynamoDB.DocumentClient();

module.exports.updateDynamo = async function updateDynamo(table, PK, SK, updateValue, updateLocation, updateLocationAttributeNames) {
  let params = {
    TableName: table,
    Key: {
      'userId': PK,
      'breed': SK
    },
    UpdateExpression: `SET ${updateLocationAttributeNames} = :message`,
    ExpressionAttributeNames: {

    },
    ExpressionAttributeValues: {
      ':message': updateValue
    }
  };
  
  updateLocationAttributeNames.split(".").forEach((attributeName, index) => {
    params.ExpressionAttributeNames[attributeName] = updateLocation[index]
  });

  let response = await documentClient.update(params).promise()
  .then((data) => {
    return {responseCode: 200, data: JSON.stringify(data)};
  })
  .catch((error) => {
    return {responseCode: 400, data: JSON.stringify({}), error: JSON.stringify(error)};
  })
  return response
};
