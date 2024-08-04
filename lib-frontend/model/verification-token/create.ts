import prisma from '$lib/prisma/connect';

export interface DbVerificationTokenRequest {
	identifier: string;
	token: string;
	expires: Date;
}

export async function dbVerificationTokenCreate(req: DbVerificationTokenRequest) {
	let dbError: Error | undefined;

	const user = await prisma.verificationToken
		.create({
			data: req
		})
		.catch((e: Error) => {
			dbError = e;
			return undefined;
		});

	return { user, dbError };
}
