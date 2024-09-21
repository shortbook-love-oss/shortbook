import prisma from '$lib-backend/database/connect';

export interface DbUserSessionCreateRequest {
	sessionToken: string; // Random string
	userId: string;
	expires: Date;
}

export async function dbUserSessionCreate(req: DbUserSessionCreateRequest) {
	let dbError: Error | undefined;

	const userSession = await prisma.sessions
		.create({
			data: {
				session_token: req.sessionToken,
				user_id: req.userId,
				expires: req.expires
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to create user session. User ID=${req.userId}`);
			return undefined;
		});

	return { userSession, dbError };
}
