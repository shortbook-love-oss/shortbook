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
	isIncludeDraft?: boolean;
	isIncludeDelete?: boolean;
};

export async function dbBookGet(req: DbBookGetRequest) {
	let dbError: Error | undefined;

	const revisionWhereByCond: Prisma.book_revisionsWhereInput = {};
	if (req.isIncludeDraft) {
		revisionWhereByCond.status = { in: [0, 1] };
	} else {
		revisionWhereByCond.status = { in: [1] };
	}

	const whereCondDelete: { deleted_at?: null } = {};
	if (!req.isIncludeDelete) {
		whereCondDelete.deleted_at = null;
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
					take: req.isIncludeDraft ? 2 : 1, // Get latest draft and previos published
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
