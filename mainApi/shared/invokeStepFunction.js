const aws = require('aws-sdk');

module.exports.invokeStepFunction = async function invokeStepFunction(payload) {
  return await new Promise((resolve, reject) => {
    const params = {
      stateMachineArn: 'arn:aws:states:us-east-1:082503240469:stateMachine:PostSchedulerStateMachine-anNIyUDntnRH',
      input: JSON.stringify(payload)
    }
    var stepfunctions = new aws.StepFunctions()
    stepfunctions.startExecution(params, (err, results) => {
      if(err) reject(err)
      else resolve(results)
    })
  })
}