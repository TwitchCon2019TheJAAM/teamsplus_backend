import * as jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'

dotenv.config();

export interface TwitchJWTSchema {
	channel_id: string,
	exp: number,
	is_unlinked: boolean,
	opaque_user_id: string, //Values beginning with "U" are stable references to a Twitch account across sessions and channels. You can use them to provide persistent services to users.
	pubsub_perms: {
		listen : string[],
		send: string[]
	},
	role: string,
	user_id: string
}

export function validateToken(token:string) : TwitchJWTSchema {
	const secret = Buffer.from(process.env.EXTENSION_SECRET, 'base64');
	let decodedToken;
	try {
		decodedToken = jwt.verify(token, secret)
		if(decodedToken.opaque_user_id.charAt(0) !== 'U') {
			throw new Error('Non-stable user_id from token')
		} else if(decodedToken.role !== 'broadcaster') {
			throw new Error('Only broadcasters can modify their list')
		}
	} catch (error) {
		console.error(error);
		throw new Error(`Invalid token ${token}`);
	}
	return decodedToken;
}