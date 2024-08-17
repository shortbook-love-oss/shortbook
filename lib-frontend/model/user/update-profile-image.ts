import prisma from '$lib/prisma/connect';

export interface DbUserProfileImageRequest {
	userId: string;
	image: string;
}

export async function dbUserProfileImageUpdate(req: DbUserProfileImageRequest) {
	let dbError: Error | undefined;

	const user = await prisma.user
		.update({
			where: {
				id: req.userId,
				deleted_at: null
			},
			data: {
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
			dbError ??= new Error(`Failed to update profile image. User ID=${req.userId}`);
			return undefined;
		});

	return { user, dbError };
}
