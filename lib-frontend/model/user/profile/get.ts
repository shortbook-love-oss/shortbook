import prisma from '$lib/prisma/connect';

export interface DbUserProfileGetRequest {
	userId: string;
}

export async function dbUserProfileGet(req: DbUserProfileGetRequest) {
	let dbError: Error | undefined;

	const profile = await prisma.user_profiles
		.findFirst({
			where: {
				user_id: req.userId
			},
			include: {
				languages: true
			}
		})
		.catch((e: Error) => {
			dbError = e;
			return undefined;
		});

	return { profile, dbError };
}
