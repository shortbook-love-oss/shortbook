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
				file_path: true,
				property: {
					select: {
						width: true,
						height: true,
						mime_type: true
					}
				},
				languages: {
					where: {
						OR: [
							{ language_code: '' },
							{ language_code: req.languageCode }
						]
					},
					select: {
						language_code: true,
						alt: true
					},
					orderBy: {
						id: 'asc'
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
