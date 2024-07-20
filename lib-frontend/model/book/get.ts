import prisma from '$lib/prisma/connect';

export interface DbBookGetRequest {
	bookId: string;
	userId?: string;
}

export async function dbBookGet(req: DbBookGetRequest) {
	let dbError: Error | undefined;

	const book = await prisma.books
		.findUnique({
			where: {
				id: req.bookId,
				deleted_at: null
			},
			include: {
				cover: {
					where: { deleted_at: null }
				},
				languages: {
					where: { deleted_at: null }
				},
				tags: {
					where: { deleted_at: null },
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
									select: {
										language_code: true,
										pen_name: true,
										headline: true,
									},
									where: {
										deleted_at: null
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
