import prisma from '$lib/prisma/connect';

export interface DbUserProvideDataRequest {
	userId: string;
	email: string;
	image: string;
}

export async function dbUserProvideDataUpdate(req: DbUserProvideDataRequest) {
	let dbError: Error | undefined;

	const user = await prisma.user
		.update({
			where: {
				id: req.userId,
				deleted_at: null
			},
			data: {
				email: req.email,
				image: req.image
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
