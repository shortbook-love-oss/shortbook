import prisma from '$lib/prisma/connect';

export interface DbVerificationTokenCreateRequest {
	identifier: string;
	token: string;
	// Don't use empty string for Auth.js default process, use user-id or null
	userId: string | null;
	expires: Date;
}

export async function dbVerificationTokenCreate(req: DbVerificationTokenCreateRequest) {
	let dbError: Error | undefined;

	const user = await prisma.verificationToken
		.create({
			data: {
				identifier: req.identifier,
				token: req.token,
				user_id: req.userId,
				expires: req.expires
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to create token. Type=${req.identifier}`);
			return undefined;
		});

	return { user, dbError };
}
