const AWS = require('aws-sdk');
var documentClient = new AWS.DynamoDB.DocumentClient();

module.exports.postDynamo = async function postDynamo(table, item) {
    
    var params  = {
        TableName: table,
        Item: item
    };
    
    let response = null
    await documentClient.put(params).promise()
      .then((data) => {
        response = {responseCode: 200, data: JSON.stringify(data)};
      })
      .catch((error) => {
        response = {responseCode: 400, data: JSON.stringify({}), error: JSON.stringify(error)};
      })
    return response
};
