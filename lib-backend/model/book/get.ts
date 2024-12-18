import { Prisma } from '@prisma/client';
import prisma from '$lib-backend/database/connect';
import type { AvailableLanguageTags } from '$lib/utilities/language';

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
	contentsLanguage?: AvailableLanguageTags;
	isIncludeDelete?: boolean;
};

export async function dbBookGet(req: DbBookGetRequest) {
	const whereByCond: Prisma.booksWhereInput = {};
	if (req.statuses != null || (req.userKeyHandle && req.bookUrlSlug)) {
		whereByCond.revisions = {
			some: {
				status: req.statuses != null ? { in: req.statuses } : undefined,
				url_slug: req.bookUrlSlug
			}
		};
		whereByCond.user = {
			key_handle: req.userKeyHandle
		};
	}
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

	const { book, dbError } = await prisma.books
		.findFirst({
			where: {
				...whereByCond,
				...whereCondDelete,
				id: req.bookId
			},
			include: {
				revisions: {
					where: {
						...revisionWhereByCond,
						...whereCondDelete
					},
					orderBy: { number: 'desc' },
					take: getRevisionsCount,
					include: {
						translate_languages: {
							where: { ...whereCondDelete }
						},
						contents: req.contentsLanguage
							? {
									where: {
										...whereCondDelete,
										language_tag: req.contentsLanguage
									}
								}
							: undefined,
						cover: {
							where: { ...whereCondDelete }
						}
					}
				},
				user: {
					select: {
						key_handle: true,
						pen_name: true,
						native_language_tag: true,
						image_src: true,
						languages: {
							where: { ...whereCondDelete },
							select: {
								language_tag: true,
								headline: true
							}
						}
					}
				}
			}
		})
		.then((book) => {
			if (book && req.userId && book.user_id !== req.userId) {
				const dbError = new Error(
					`Can't edit book written by other writer. Book ID=${req.bookId} or Key-name=${req.bookUrlSlug}`
				);
				return { book: undefined, dbError };
			}
			return { book, dbError: undefined };
		})
		.catch((error: Error) => {
			console.error('dbBookGet', req, 'error', error);
			const dbError = new Error(
				`Failed to get book. Book ID=${req.bookId} or Key-name=${req.bookUrlSlug}`
			);
			return { book: undefined, dbError };
		});

	const bookRevision = book?.revisions.at(0);

	return { book, bookRevision, dbError };
}
