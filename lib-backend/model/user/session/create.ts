import prisma from '$lib-backend/database/connect';

export interface DbUserSessionCreateRequest {
	sessionToken: string; // Random string
	userId: string;
	expires: Date;
}

export async function dbUserSessionCreate(req: DbUserSessionCreateRequest) {
	let dbError: Error | undefined;

	const userSession = await prisma.session
		.create({
			data: {
				sessionToken: req.sessionToken,
				userId: req.userId,
				expires: req.expires
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to create user session. User ID=${req.userId}`);
			return undefined;
		});

	return { userSession, dbError };
}
