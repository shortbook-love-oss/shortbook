import prisma from '$lib/prisma/connect';

export interface DbBookDeleteRequest {
	bookId: string;
	userId: string;
}

export async function dbBookDelete(req: DbBookDeleteRequest) {
	let dbError: Error | undefined;

	const bookBeforeDelete = await prisma.books.findUnique({
		select: {
			user_id: true
		},
		where: {
			id: req.bookId,
			deleted_at: null
		}
	});
	if (!bookBeforeDelete) {
		dbError ??= new Error(`Can't find book. Book ID=${req.bookId}`);
		return { dbError };
	} else if (bookBeforeDelete.user_id !== req.userId) {
		dbError ??= new Error(`Can't delete book written by other writer. Book ID=${req.bookId}`);
		return { dbError };
	}

	await prisma
		.$transaction(async (tx) => {
			const deletedAt = new Date();
			await tx.books.update({
				where: {
					id: req.bookId,
					deleted_at: null
				},
				data: {
					deleted_at: deletedAt
				}
			});
			await tx.book_covers.update({
				where: {
					book_id: req.bookId,
					deleted_at: null
				},
				data: {
					deleted_at: deletedAt
				}
			});
			await tx.book_languages.updateMany({
				where: {
					book_id: req.bookId,
					deleted_at: null
				},
				data: {
					deleted_at: deletedAt
				}
			});
			await tx.book_tags.updateMany({
				where: {
					book_id: req.bookId,
					deleted_at: null
				},
				data: {
					deleted_at: deletedAt
				}
			});
		})
		.catch(() => {
			dbError ??= new Error(`Failed to delete book. Book ID=${req.bookId}`);
			return undefined;
		});

	return { dbError };
}
