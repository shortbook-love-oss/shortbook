import prisma from '$lib/prisma/connect';

export interface DbUserPointListRequest {
	userId: string;
}

export async function dbUserPointList(req: DbUserPointListRequest) {
	let dbError: Error | undefined;

	const userPointHistory = await prisma.user_points
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
	for (const item of userPointHistory ?? []) {
		currentPoint += item.amount;
	}

	return { userPointHistory, currentPoint, dbError };
}
