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
			select: {
				id: true,
				user_id: true,
				name: true,
				alt: true,
				property: {
					select: {
						file_path: true,
						width: true,
						height: true,
						mime_type: true
					}
				}
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
