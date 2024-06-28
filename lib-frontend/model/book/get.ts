import prisma from '$lib/prisma/connect';

export interface DbBookGetRequest {
	bookId: string;
	userId: string;
}

export async function dbBookGet(req: DbBookGetRequest) {
	let dbError: Error | undefined;

	const book = await prisma.books
		.findUnique({
			where: {
				id: req.bookId
			},
			include: {
				languages: true,
				tags: true
			}
		})
		.then((book) => {
			if (book?.user_id !== req.userId) {
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
