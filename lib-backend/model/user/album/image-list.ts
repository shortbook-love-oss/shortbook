import prisma from '$lib-backend/database/connect';

export interface DbUserAlbumImageListRequest {
	userId?: string;
	languageCode: string;
}

export async function dbUserAlbumImageList(req: DbUserAlbumImageListRequest) {
	let dbError: Error | undefined;

	const albumImages = await prisma.user_images
		.findMany({
			where: {
				user_id: req.userId
			},
			include: {
				property: true,
				tags: true
			},
			orderBy: {
				created_at: 'desc'
			}
		})
		.catch((error: Error) => {
			dbError ??= new Error(`Failed to get user album images. User ID=${req.userId}`);
			return undefined;
		});

	return { albumImages, dbError };
}
