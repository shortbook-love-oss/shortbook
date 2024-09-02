import prisma from '$lib-backend/database/connect';

export interface DbUserPointListRequest {
	userId: string;
}

export async function dbUserPointList(req: DbUserPointListRequest) {
	let dbError: Error | undefined;

	const userPointHistories = await prisma.user_points
		.findMany({
			where: {
				user_id: req.userId,
				deleted_at: null
			},
			orderBy: {
				created_at: 'desc'
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to get user point history. User ID=${req.userId}`);
			return undefined;
		});

	let currentPoint = 0;
	for (const item of userPointHistories ?? []) {
		currentPoint += item.amount;
	}

	return { userPointHistories, currentPoint, dbError };
}
