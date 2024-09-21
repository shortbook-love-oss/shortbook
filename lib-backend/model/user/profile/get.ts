import prisma from '$lib-backend/database/connect';

export interface DbUserProfileGetRequest {
	userId: string;
}

export async function dbUserProfileGet(req: DbUserProfileGetRequest) {
	let dbError: Error | undefined;

	const user = await prisma.users
		.findUnique({
			where: {
				id: req.userId,
				deleted_at: null
			},
			include: {
				languages: {
					where: { deleted_at: null }
				}
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to get user. User ID=${req.userId}`);
			return undefined;
		});

	return { user, dbError };
}
