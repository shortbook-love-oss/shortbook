import prisma from '$lib/prisma/connect';

export interface DbUserEmailUpdateRequest {
	userId: string;
	email: string;
}

export async function dbUserEmailUpdate(req: DbUserEmailUpdateRequest) {
	let dbError: Error | undefined;

	const user = await prisma.user
		.update({
			where: {
				id: req.userId,
				deleted_at: null
			},
			data: {
				email: req.email
			}
		})
		.then((user) => {
			if (!user) {
				dbError ??= new Error(`Can't find user. User ID=${req.userId}`);
				return undefined;
			}
			return user;
		})
		.catch(() => {
			dbError ??= new Error(`Failed to update user email. User ID=${req.userId}`);
			return undefined;
		});

	return { user, dbError };
}
