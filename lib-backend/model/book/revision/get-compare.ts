import { Prisma } from '@prisma/client';
import prisma from '$lib-backend/database/connect';
import type { AvailableLanguageTags } from '$lib/utilities/language';

type DbBookRevisionGetCompareRequest = {
	newerRevisionId: string;
	statuses?: number[];
	contentsLanguage?: AvailableLanguageTags;
	isIncludeDelete?: boolean;
};

// [
//   { id: 'A newer revision made at the same time' },
//   { id: latestRevisionId },  ← Select anchor
//   { id: 'foo' }  ← Select focus
// ]
export async function dbBookRevisionGetCompare(req: DbBookRevisionGetCompareRequest) {
	const whereByCond: Prisma.book_revisionsWhereInput = {};
	if (req.statuses) {
		whereByCond.status = { in: req.statuses };
	}
	const whereCondDelete: { deleted_at?: null } = {};
	if (!req.isIncludeDelete) {
		whereCondDelete.deleted_at = null;
	}

	const { latestRevision, beforeRevision, dbError } = await prisma.book_revisions
		.findMany({
			where: {
				...whereByCond,
				...whereCondDelete
			},
			orderBy: [{ book_id: 'desc' }, { number: 'desc' }],
			cursor: { id: req.newerRevisionId },
			take: 2,
			select: {
				id: true,
				number: true,
				native_language_tag: true,
				contents: {
					where: {
						...whereCondDelete,
						language_tag: req.contentsLanguage
					},
					select: {
						language_tag: true,
						title: true,
						subtitle: true,
						free_area_html: true,
						paid_area_html: true,
						sales_area_html: true
					}
				}
			}
		})
		.then((revisions) => {
			const latestRevision = revisions.at(0);
			const beforeRevision = revisions.at(1);
			return {
				latestRevision,
				beforeRevision,
				dbError: undefined
			};
		})
		.catch((error: Error) => {
			console.error(error);
			const dbError = new Error(
				`Failed to get book contents. Book Revision ID=${req.newerRevisionId}`
			);
			return {
				latestRevision: undefined,
				beforeRevision: undefined,
				dbError
			};
		});

	return { latestRevision, beforeRevision, dbError };
}
