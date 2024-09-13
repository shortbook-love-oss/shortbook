import prisma from '$lib-backend/database/connect';

export interface DbUserAlbumImageListRequest {
	userId?: string;
	languageCode: string;
	isIncludeDelete?: boolean;
}

export async function dbUserAlbumImageList(req: DbUserAlbumImageListRequest) {
	let dbError: Error | undefined;

	const whereCondDelete: { deleted_at?: null } = {};
	if (!req.isIncludeDelete) {
		whereCondDelete.deleted_at = null;
	}

	const albumImages = await prisma.user_images
		.findMany({
			where: {
				user_id: req.userId,
				...whereCondDelete
			},
			include: {
				property: {
					where: { ...whereCondDelete }
				},
				license: {
					where: { ...whereCondDelete }
				},
				tags: {
					where: { ...whereCondDelete }
				}
			},
			orderBy: {
				created_at: 'desc'
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to get user album images. User ID=${req.userId}`);
			return undefined;
		});

	return { albumImages, dbError };
}
