import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk';

const s3 = new AWS.S3({
  signatureVersion: 'v4'
});

const docClient = new AWS.DynamoDB.DocumentClient();

const todoTable = process.env.TODOS_TABLE;
const bucketName = process.env.TODOS_S3_BUCKET;
const urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION);
const todoIdIndex = process.env.TODO_ID_INDEX;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;

  const url = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  })

  const result = await docClient.query({
    TableName : todoTable,
    IndexName : todoIdIndex,
    KeyConditionExpression: 'todoId = :todoId',
    ExpressionAttributeValues: {
      ':todoId': todoId
    }
  }).promise()

  if (result.Count !=  0){
    const todo = {
      ...result.Items[0],
      attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
    }

    await docClient.put({
      TableName: todoTable,
      Item: todo
    }).promise();

  } else {

    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: ''
    }
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadUrl: url
    })
  }
}
