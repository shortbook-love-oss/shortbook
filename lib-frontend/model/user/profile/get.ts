import prisma from '$lib/prisma/connect';

export interface DbUserProfileGetRequest {
	userId: string;
}

export async function dbUserProfileGet(req: DbUserProfileGetRequest) {
	let error: Error | undefined;

	const profile = await prisma.user_profiles
		.findFirst({
			where: {
				user_id: req.userId
			},
			include: {
				langs: true
			}
		})
		.catch((e: Error) => {
			error = e;
			return undefined;
		});

	return { profile, error };
}
