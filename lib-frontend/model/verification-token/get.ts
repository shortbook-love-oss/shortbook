import prisma from '$lib/prisma/connect';

export interface DbVerificationTokenGetRequest {
	identifier: string;
	token: string;
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
