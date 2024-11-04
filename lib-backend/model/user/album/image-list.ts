import { Prisma } from '@prisma/client';
import prisma from '$lib-backend/database/connect';

export interface DbUserAlbumImageListRequest {
	userId?: string;
	isIncludeDelete?: boolean;
	limit?: number;
	page?: number;
	createdBefore?: Date;
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
		take = req.limit;
	}

	const whereCond: Prisma.user_imagesWhereInput = {
		user_id: req.userId,
		...whereCondDelete
	};
	if (req.createdBefore != undefined) {
		whereCond.created_at = { lte: req.createdBefore };
	}

	const [albumImages, count] = await Promise.all([
		prisma.user_images
			.findMany({
				where: whereCond,
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
			}),
		prisma.user_images
			.count({
				where: whereCond
			})
			.catch(() => {
				dbError ??= new Error(`Failed to count user album images. User ID=${req.userId}`);
				return undefined;
			})
	]);

	return { albumImages, count, dbError };
}
