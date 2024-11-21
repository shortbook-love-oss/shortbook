import { Prisma } from '@prisma/client';
import prisma from '$lib-backend/database/connect';

type DbBookRevisionListRequest = {
	bookId: string;
	statuses?: number[];
	isIncludeDelete?: boolean;
};

export async function dbBookRevisionList(req: DbBookRevisionListRequest) {
	let dbError: Error | undefined;

	const whereByCond: Prisma.book_revisionsWhereInput = {};
	if (req.statuses) {
		whereByCond.status = { in: req.statuses };
	}
	const whereCondDelete: { deleted_at?: null } = {};
	if (!req.isIncludeDelete) {
		whereCondDelete.deleted_at = null;
	}

	const revisions = await prisma.book_revisions
		.findMany({
			where: {
				book_id: req.bookId,
				...whereByCond,
				...whereCondDelete
			},
			orderBy: {
				number: 'desc'
			},
			omit: {
				free_area: true,
				paid_area: true,
				sales_area: true
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to get book. Book ID=${req.bookId}`);
			return undefined;
		});

	return { revisions, dbError };
}
