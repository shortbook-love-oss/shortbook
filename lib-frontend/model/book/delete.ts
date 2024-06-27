import prisma from '$lib/prisma/connect';

export interface DbBookDeleteRequest {
	bookId: string;
	userId: string;
}

export async function dbBookDeleteRequest(req: DbBookDeleteRequest) {
	let dbError: Error | undefined;

	const bookBeforeDelete = await prisma.books.findUnique({
		select: {
			user_id: true
		},
		where: {
			id: req.bookId
		}
	});
	if (bookBeforeDelete?.user_id !== req.userId) {
		throw new Error(`Can't delete book written by other writer.`);
	}

	await prisma
		.$transaction(async (tx) => {
			const deletedAt = new Date();
			await tx.books.update({
				where: {
					id: req.bookId
				},
				data: {
					deleted_at: deletedAt
				}
			});
			await tx.book_languages.updateMany({
				where: {
					book_id: req.bookId
				},
				data: {
					deleted_at: deletedAt
				}
			});
			await tx.book_tags.updateMany({
				where: {
					book_id: req.bookId
				},
				data: {
					deleted_at: deletedAt
				}
			});
			// Don't delete book_buys
		})
		.catch((e: Error) => {
			dbError = e;
			return undefined;
		});

	return { dbError };
}
