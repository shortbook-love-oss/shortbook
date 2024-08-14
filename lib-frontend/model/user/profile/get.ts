import prisma from '$lib/prisma/connect';

export interface DbUserProfileGetRequest {
	userId: string;
}

export async function dbUserProfileGet(req: DbUserProfileGetRequest) {
	let dbError: Error | undefined;

	const user = await prisma.user
		.findUnique({
			where: {
				id: req.userId,
				deleted_at: null
			},
			include: {
				accounts: {
					where: { deleted_at: null },
					select: {
						provider: true
					}
				},
				profiles: {
					include: {
						languages: {
							where: { deleted_at: null }
						}
					}
				}
			}
		})
		.then((user) => {
			if (!user?.profiles) {
				dbError ??= new Error(`Can't find user profile. User ID=${req.userId}`);
				return undefined;
			}
			return user;
		})
		.catch(() => {
			dbError ??= new Error(`Failed to get user. User ID=${req.userId}`);
			return undefined;
		});

	const account = user?.accounts[0];
	const profile = user?.profiles;

	return { user, account, profile, dbError };
}
