import prisma from '$lib-backend/database/connect';

export interface DbUserGetBySessionTokenRequest {
	sessionToken: string;
}

export async function dbUserGetBySessionToken(req: DbUserGetBySessionTokenRequest) {
	const now = new Date();
	let dbError: Error | undefined;

	const user = await prisma.users
		.findFirst({
			where: {
				sessions: {
					some: {
						session_token: req.sessionToken,
						expires: {
							gte: now
						}
					}
				}
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to get user.`);
			return undefined;
		});

	return { user, dbError };
}
