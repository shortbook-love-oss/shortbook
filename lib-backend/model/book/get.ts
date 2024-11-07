import { Prisma } from '@prisma/client';
import prisma from '$lib-backend/database/connect';

type IdExclusiveProps =
	| {
			bookId: string;
			bookUrlSlug?: never;
			userKeyHandle?: never;
	  }
	| {
			bookId?: never;
			bookUrlSlug: string;
			userKeyHandle: string;
	  };

type DbBookGetRequest = IdExclusiveProps & {
	userId?: string;
	statuses?: number[]; // 0: Draft 1: Published
	isIncludeDelete?: boolean;
};

export async function dbBookGet(req: DbBookGetRequest) {
	let dbError: Error | undefined;

	const revisionWhereByCond: Prisma.book_revisionsWhereInput = {};
	if (req.statuses) {
		revisionWhereByCond.status = { in: req.statuses };
	}
	const whereCondDelete: { deleted_at?: null } = {};
	if (!req.isIncludeDelete) {
		whereCondDelete.deleted_at = null;
	}

	let getRevisionsCount = 1;
	if (req.statuses == undefined || req.statuses.some((status) => status !== 1)) {
		// Get latest draft and previos published
		getRevisionsCount = 2;
	}

	const book = await prisma.books
		.findFirst({
			where: {
				id: req.bookId,
				url_slug: req.bookUrlSlug,
				...whereCondDelete,
				user: {
					key_handle: req.userKeyHandle,
					...whereCondDelete
				}
			},
			include: {
				revisions: {
					where: {
						...revisionWhereByCond,
						...whereCondDelete
					},
					orderBy: {
						number: 'desc'
					},
					take: getRevisionsCount,
					include: {
						cover: {
							where: { ...whereCondDelete }
						},
						contents: {
							where: { ...whereCondDelete }
						}
					}
				},
				user: {
					select: {
						key_handle: true,
						pen_name: true,
						image_src: true,
						languages: {
							where: { ...whereCondDelete },
							select: {
								target_language: true,
								headline: true
							}
						}
					}
				}
			}
		})
		.then((book) => {
			if (!book) {
				dbError ??= new Error(
					`Can't find book. Book ID=${req.bookId} or Key-name=${req.bookUrlSlug}`
				);
				return undefined;
			} else if (req.userId && book.user_id !== req.userId) {
				dbError ??= new Error(
					`Can't edit book written by other writer. Book ID=${req.bookId} or Key-name=${req.bookUrlSlug}`
				);
				return undefined;
			}
			return book;
		})
		.catch(() => {
			dbError ??= new Error(
				`Failed to get book. Book ID=${req.bookId} or Key-name=${req.bookUrlSlug}`
			);
			return undefined;
		});

	const bookRevision = book?.revisions[0];

	return { book, bookRevision, dbError };
}
