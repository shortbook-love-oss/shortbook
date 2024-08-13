import prisma from '$lib/prisma/connect';

export interface DbBookGetRequest {
	bookId: string;
	userId?: string;
	isIncludeDelete?: boolean;
}

export async function dbBookGet(req: DbBookGetRequest) {
	let dbError: Error | undefined;

	const whereCondDelete: { deleted_at?: null } = {};
	if (!req.isIncludeDelete) {
		whereCondDelete.deleted_at = null;
	}

	const book = await prisma.books
		.findUnique({
			where: {
				id: req.bookId,
				...whereCondDelete
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
					orderBy: {
						sort: 'asc'
					}
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
				dbError ??= new Error(`Can't find book. Book ID=${req.bookId}`);
				return undefined;
			} else if (req.userId && book.user_id !== req.userId) {
				dbError ??= new Error(`Can't edit book written by other writer. Book ID=${req.bookId}`);
				return undefined;
			}
			return book;
		})
		.catch(() => {
			dbError ??= new Error(`Failed to get book. Book ID=${req.bookId}`);
			return undefined;
		});

	return { book, dbError };
}
