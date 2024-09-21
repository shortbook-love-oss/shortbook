import prisma from '$lib-backend/database/connect';

export interface DbVerificationTokenDeleteRequest {
	identifier: string;
	token: string;
}

export async function dbVerificationTokenDelete(req: DbVerificationTokenDeleteRequest) {
	let dbError: Error | undefined;

	await prisma.verification_tokens
		.deleteMany({
			where: {
				identifier: req.identifier,
				token: req.token
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to delete token. Type=${req.identifier}`);
			return undefined;
		});

	return { dbError };
}
