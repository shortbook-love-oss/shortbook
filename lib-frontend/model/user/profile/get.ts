import prisma from '$lib/prisma/connect';

export interface DbUserProfileGetRequest {
	userId: string;
}

export async function dbUserProfileGet(req: DbUserProfileGetRequest) {
	let dbError: Error | undefined;

	const profile = await prisma.user_profiles
		.findFirst({
			where: {
				user_id: req.userId,
				deleted_at: null
			},
			include: {
				languages: {
					where: { deleted_at: null }
				}
			}
		})
		.then((profile) => {
			if (!profile) {
				dbError ??= new Error(`Can't find user profile. User ID=${req.userId}`);
				return undefined;
			}
			return profile;
		})
		.catch(() => {
			dbError ??= new Error(`Failed to get user. User ID=${req.userId}`);
			return undefined;
		});

	return { profile, dbError };
}
