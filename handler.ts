import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk'
import 'source-map-support/register';

const dynamoDb = new DynamoDB.DocumentClient();

interface ViewerDataSchema {
  id: string,
  role: string,
  trusted_by: string
}
interface TeamDataSchema {
  id: string,
  members: string[],
  viewers: ViewerDataSchema[]
  createdAt: number,
  updatedAt: number
}

export const getTeamUsers: APIGatewayProxyHandler = async (event, _context) => {
  const teamId = event.pathParameters.id;
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: { id: teamId }
  }
  try {
    const dbResult = await dynamoDb.get(params).promise();
    const data = dbResult.Item as TeamDataSchema;
    let retData = {
      team: data.id,
      users: data.members
    }
    return {
      statusCode: 200,
      body: JSON.stringify(retData)
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: error.statusCode || 501,
      headers: { 'Content-Type': 'text/plain' },
      body: `Failed to fetch team ${teamId}`
    }
  }
}

export const setTeamUser: APIGatewayProxyHandler = async (event, _context) => {
  //Validate auth
  // let token:TwitchJWTSchema;
  // try {
  // 	token = validateToken(event.headers.TwitchAuthToken);
  // } catch (error) {
  // 	console.error(error);
  // 	return {
  // 		statusCode: error.statusCode || 501,
  // 		headers: {'Content-Type': 'text/plain'},
  // 		body: `Invalid token`
  // 	}
  // }

  console.log(event.body);
  const data = JSON.parse(event.body);
  const user = data.user;
  const role = data.role;
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Successfully assigned ${user} to role ${role}`
    }, null, 2),
  };
}

export const getViewerRole: APIGatewayProxyHandler = async (event, _context) => {
  const userId = event.pathParameters.id;
  const streamId = event.queryStringParameters.stream_id;
  return {
    statusCode: 200,
    body: JSON.stringify({
      team: streamId,
      id: userId,
      role: 'TRUSTED',
    }, null, 2),
  };
}

export const getTeamId: APIGatewayProxyHandler = async (event, _context) => {
  const userId = event.pathParameters.id;
  console.log(`giving fake team TEST_TEAM to ${userId}`);
  return {
    statusCode: 200,
    body: JSON.stringify({
      team: "TEST_TEAM",
    }, null, 2),
  };
}

export const setTeamId: APIGatewayProxyHandler = async (event, _context) => {
  //Validate auth
  // let token:TwitchJWTSchema;
  // try {
  // 	token = validateToken(event.headers.TwitchAuthToken);
  // } catch (error) {
  // 	console.error(error);
  // 	return {
  // 		statusCode: error.statusCode || 501,
  // 		headers: {'Content-Type': 'text/plain'},
  // 		body: `Invalid token`
  // 	}
  // }

  console.log(event.body);
  const userId = event.pathParameters.id;
  const data = JSON.parse(event.body);
  const teamId = data.team_id;
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Successfully added ${userId} to team ${teamId}`
    }, null, 2),
  };
}

