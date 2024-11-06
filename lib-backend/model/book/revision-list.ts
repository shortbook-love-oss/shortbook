import { Prisma } from '@prisma/client';
import prisma from '$lib-backend/database/connect';

type DbBookRevisionListRequest = {
	bookId: string;
	isIncludeDraft?: boolean;
	isIncludeDelete?: boolean;
};

export async function dbBookRevisionList(req: DbBookRevisionListRequest) {
	let dbError: Error | undefined;

	const whereByCond: Prisma.book_revisionsWhereInput = {};
	if (req.isIncludeDraft) {
		whereByCond.status = { in: [0, 1] };
	} else {
		whereByCond.status = { in: [1] };
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
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to get book. Book ID=${req.bookId}`);
			return undefined;
		});

	return { revisions, dbError };
}
