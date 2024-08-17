import { Prisma } from '@prisma/client';
import prisma from '$lib/prisma/connect';

type IdExclusiveProps =
	| {
			bookId: string;
			bookKeyName?: never;
			userKeyName?: never;
	  }
	| {
			bookId?: never;
			bookKeyName: string;
			userKeyName: string;
	  };

type DbBookGetRequest = IdExclusiveProps & {
	userId?: string;
	isIncludeDraft?: boolean;
	isIncludeDelete?: boolean;
};

export async function dbBookGet(req: DbBookGetRequest) {
	let dbError: Error | undefined;

	const whereByCond: Prisma.booksWhereInput = {};
	if (req.isIncludeDraft) {
		whereByCond.status = { in: [0, 1] };
	} else {
		whereByCond.status = { in: [1] };
	}

	const whereCondDelete: { deleted_at?: null } = {};
	if (!req.isIncludeDelete) {
		whereCondDelete.deleted_at = null;
	}

	const book = await prisma.books
		.findFirst({
			where: {
				id: req.bookId,
				key_name: req.bookKeyName,
				...whereByCond,
				...whereCondDelete,
				user: {
					profiles: {
						key_name: req.userKeyName,
						...whereCondDelete
					}
				}
			},
			include: {
				cover: {
					where: { ...whereCondDelete }
				},
				languages: {
					where: { ...whereCondDelete }
				},
				tags: {
					where: { ...whereCondDelete },
					orderBy: { sort: 'asc' }
				},
				user: {
					select: {
						image: true,
						profiles: {
							select: {
								key_name: true,
								languages: {
									where: { ...whereCondDelete },
									select: {
										language_code: true,
										pen_name: true,
										headline: true
									}
								}
							}
						}
					}
				}
			}
		})
		.then((book) => {
			if (!book) {
				dbError ??= new Error(
					`Can't find book. Book ID=${req.bookId} or Key-name=${req.bookKeyName}`
				);
				return undefined;
			} else if (req.userId && book.user_id !== req.userId) {
				dbError ??= new Error(
					`Can't edit book written by other writer. Book ID=${req.bookId} or Key-name=${req.bookKeyName}`
				);
				return undefined;
			}
			return book;
		})
		.catch(() => {
			dbError ??= new Error(
				`Failed to get book. Book ID=${req.bookId} or Key-name=${req.bookKeyName}`
			);
			return undefined;
		});

	return { book, dbError };
}
