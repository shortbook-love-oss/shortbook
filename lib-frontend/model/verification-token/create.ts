import prisma from '$lib/prisma/connect';

export interface DbVerificationTokenCreateRequest {
	identifier: string;
	token: string;
	expires: Date;
}

export async function dbVerificationTokenCreate(req: DbVerificationTokenCreateRequest) {
	let dbError: Error | undefined;

	const user = await prisma.verificationToken
		.create({
			data: {
				identifier: req.identifier,
				token: req.token,
				expires: req.expires
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to create token. Type=${req.identifier}`);
			return undefined;
		});

	return { user, dbError };
}
