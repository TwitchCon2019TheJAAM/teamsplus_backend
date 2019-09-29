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
  viewers: {[index:string]:ViewerDataSchema}
  createdAt: number,
  updatedAt: number
}

async function internalGetTeam(teamId:string):Promise<TeamDataSchema> {
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: { id: teamId }
  }
  const dbResult = await dynamoDb.get(params).promise();
  return dbResult.Item as TeamDataSchema;
}

async function internalSetTeam(data:TeamDataSchema):Promise<void> {
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: data
  }
  await dynamoDb.put(params).promise();
}

export const getTeamUsers: APIGatewayProxyHandler = async (event, _context) => {
  const teamId = event.pathParameters.id;
  try {
    const data = await internalGetTeam(teamId);
    let retData = {
      team: data.id,
      users: data.viewers
    }
    return {
      statusCode: 200,
      body: JSON.stringify(retData),
      headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true, }
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: error.statusCode || 501,
      headers: { 'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true, },
      body: `Failed to fetch team ${teamId}`,
      
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

  const teamId = event.pathParameters.id;
  console.log(event.body);
  const data = JSON.parse(event.body);
  const user = data.user;
  const role = data.role;

  let dbData = await internalGetTeam(teamId);
  if(!dbData) {
    dbData = {
      id:teamId,
      members:[],
      viewers:{},
      createdAt:Date.now(),
      updatedAt:Date.now()
    }
  }
  let existingViewer:any = dbData.viewers[user];
  if(!existingViewer) { existingViewer = {id:user}};
  existingViewer.role = role;
  existingViewer.trusted_by = user;
  dbData.viewers[user] = existingViewer;
  
  await internalSetTeam(dbData);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true, },
    body: JSON.stringify({
      message: `Successfully assigned ${user} to role ${role} for team ${teamId}`,
    }, null, 2),
  };
}

export const getViewerRole: APIGatewayProxyHandler = async (event, _context) => {
  const userId = event.pathParameters.id;
  // const streamId = event.queryStringParameters.stream_id;

  //TODO: Find a team with this streamid as a member
  const teamId = 'TEST_TEAM';
  let dbData = await internalGetTeam(teamId);
  if(!dbData) {
    console.error(`Failed to fetch team ${teamId}`);
    return {
      statusCode: 501,
      headers: { 'Content-Type': 'text/plain' },
      body: `Failed to fetch team ${teamId}`
    }
  }

  const viewer = dbData.viewers[userId];
  const role = viewer ? viewer.role : 'unassigned';

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true, },
    body: JSON.stringify({
      team: teamId,
      id: userId,
      role: role,
    }, null, 2),
  };
}

export const getTeamId: APIGatewayProxyHandler = async (event, _context) => {
  const userId = event.pathParameters.id;
  console.log(`giving fake team TEST_TEAM to ${userId}`);
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true, },
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
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true, },
    body: JSON.stringify({
      message: `Successfully added ${userId} to team ${teamId}`
    }, null, 2),
  };
}

