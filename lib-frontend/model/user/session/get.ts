import prisma from '$lib/prisma/connect';

export interface DbUserSessionGetRequest {
	userId: string;
	sessionToken: string;
}

export async function dbUserSessionGet(req: DbUserSessionGetRequest) {
	let dbError: Error | undefined;

	const user = await prisma.user
		.findUnique({
			where: {
				id: req.userId,
				deleted_at: null
			},
			include: {
				accounts: {
					where: { deleted_at: null }
				},
				sessions: {
					where: {
						userId: req.userId,
						sessionToken: req.sessionToken,
						deleted_at: null
					},
					take: 1
				}
			}
		})
		.then((user) => {
			if (!user?.accounts) {
				dbError ??= new Error(`Can't find user. User ID=${req.userId}`);
				return undefined;
			}
			return user;
		})
		.catch(() => {
			dbError ??= new Error(`Failed to get user session. User ID=${req.userId}`);
			return undefined;
		});

	const session = user?.sessions[0];

	return { user, session, dbError };
}
