import prisma from '$lib-backend/database/connect';

export interface DbUserAlbumImageGetRequest {
	imageId: string;
	isIncludeDelete?: boolean;
}

export async function dbUserAlbumImageGet(req: DbUserAlbumImageGetRequest) {
	let dbError: Error | undefined;

	const whereCondDelete: { deleted_at?: null } = {};
	if (!req.isIncludeDelete) {
		whereCondDelete.deleted_at = null;
	}

	const albumImage = await prisma.user_images
		.findUnique({
			where: {
				id: req.imageId,
				...whereCondDelete
			},
			include: {
				property: {
					where: { ...whereCondDelete }
				},
				creator: {
					where: { ...whereCondDelete }
				},
				tags: {
					where: { ...whereCondDelete }
				}
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to get user album image. Image ID=${req.imageId}`);
			return undefined;
		});

	return { albumImage, dbError };
}
