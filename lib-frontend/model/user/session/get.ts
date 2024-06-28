import prisma from '$lib/prisma/connect';

export interface DbUserSessionGetRequest {
	userId: string;
	sessionToken: string;
}

export async function dbUserSessionGet(req: DbUserSessionGetRequest) {
	let dbError: Error | undefined;

	const user = await prisma.user
		.findUnique({
			where: { id: req.userId },
			include: {
				accounts: true,
				sessions: {
					where: {
						userId: req.userId,
						sessionToken: req.sessionToken
					},
					take: 1
				}
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to get user session. User ID=${req.userId}`);
			return undefined;
		});

	const session = user?.sessions[0];

	return { user, session, dbError };
}
