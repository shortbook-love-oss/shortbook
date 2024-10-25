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
	let take = undefined;
	if (req.limit != undefined && req.page != undefined) {
		// Also get the first item of next page
		// If have that, current page is not the last page
		skip = req.limit * (req.page - 1);
		take = req.limit + 1;
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
			take
		})
		.catch(() => {
			dbError ??= new Error(
				`Failed to get user album images. User ID=${req.userId}, Page=${req.page}`
			);
			return undefined;
		});

	// Get all = only one page
	let isLastPage = albumImages != undefined;

	if (req.limit != undefined && req.page != undefined) {
		// Get only the page
		if (albumImages && albumImages.length > req.limit) {
			// If the page isn't last
			albumImages?.pop();
			isLastPage = false;
		}
	}

	return { albumImages, dbError, isLastPage };
}
