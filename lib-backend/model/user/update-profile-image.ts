import prisma from '$lib-backend/database/connect';

export interface DbUserProfileImageRequest {
	userId: string;
	imageSrc: string;
}

export async function dbUserProfileImageUpdate(req: DbUserProfileImageRequest) {
	let dbError: Error | undefined;

	const user = await prisma.users
		.update({
			where: {
				id: req.userId,
				deleted_at: null
			},
			data: {
				image_src: req.imageSrc
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
