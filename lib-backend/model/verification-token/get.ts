import prisma from '$lib-backend/database/connect';

export interface DbVerificationTokenGetRequest {
	identifier: string;
	token: string;
	// Don't use empty string for Auth.js default process, use user-id or null
	userId: string | null;
}

export async function dbVerificationTokenGet(req: DbVerificationTokenGetRequest) {
	let dbError: Error | undefined;
	const now = new Date();

	const verificationToken = await prisma.verificationToken
		.findUnique({
			where: {
				identifier_token: {
					identifier: req.identifier,
					token: req.token
				},
				user_id: req.userId,
				expires: {
					gte: now
				}
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to get token. Type=${req.identifier}`);
			return undefined;
		});

	return { verificationToken, dbError };
}
