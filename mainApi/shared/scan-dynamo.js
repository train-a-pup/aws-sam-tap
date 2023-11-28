const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();

module.exports.scanDynamo = async function scanDynamo(table){

  const params = {
    TableName: table,
  };

  const scanResults = [];
  try {
    let items;
    do{
        items = await documentClient.scan(params).promise();
        items.Items.forEach((item) => scanResults.push(item));
        params.ExclusiveStartKey = items.LastEvaluatedKey;
    }while(typeof items.LastEvaluatedKey !== "undefined");
  } catch (error) {
    return {responseCode: 400, data: JSON.stringify({}), error: JSON.stringify(error)};
  }
  
  return {responseCode: 200, data: JSON.stringify(scanResults)}
}