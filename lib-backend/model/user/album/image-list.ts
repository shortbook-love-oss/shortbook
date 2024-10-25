import prisma from '$lib-backend/database/connect';

export interface DbUserAlbumImageListRequest {
	userId?: string;
	isIncludeDelete?: boolean;
	limit?: number;
	page?: number;
}

export async function dbUserAlbumImageList(req: DbUserAlbumImageListRequest) {
	let dbError: Error | undefined;

	const whereCondDelete: { deleted_at?: null } = {};
	if (!req.isIncludeDelete) {
		whereCondDelete.deleted_at = null;
	}
	let skip = undefined;
	if (req.limit != undefined && req.page != undefined) {
		skip = req.limit * (req.page - 1);
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
			},
			skip,
			take: req.limit
		})
		.catch(() => {
			dbError ??= new Error(
				`Failed to get user album images. User ID=${req.userId}, Page=${req.page}`
			);
			return undefined;
		});

	return { albumImages, dbError };
}
