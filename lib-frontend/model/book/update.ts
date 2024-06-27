import prisma from '$lib/prisma/connect';
import type { DbBookCreateRequest } from './create';

export interface DbBookUpdateRequest extends DbBookCreateRequest {
	bookId: string;
}

export async function dbBookUpdateRequest(req: DbBookUpdateRequest) {
	let dbError: Error | undefined;

	const bookBeforeEdit = await prisma.books.findUnique({
		select: {
			user_id: true,
			published_at: true
		},
		where: {
			id: req.bookId
		}
	});
	if (bookBeforeEdit?.user_id !== req.userId) {
		throw new Error(`Can't edit book written by other writer.`);
	}

	let publishedAt = new Date();
	if (req.status === 0) {
		publishedAt = bookBeforeEdit.published_at;
	}

	const book = await prisma
		.$transaction(async (tx) => {
			const book = await tx.books.update({
				where: {
					id: req.bookId
				},
				data: {
					status: req.status,
					published_at: publishedAt
				}
			});
			await tx.book_languages.deleteMany({
				where: {
					book_id: book.id
				}
			});
			if (!book?.id) {
				throw new Error(`Can't find book of bookId=${req.bookId}.`);
			}

			await tx.book_languages.createMany({
				data: [
					{
						book_id: book.id,
						language_code: req.nativeLanguage,
						thumbnail_url: '',
						title: req.title,
						introduction: req.introduction,
						content: req.content,
						sales_message: req.salesMessage
					}
				]
			});

			return book;
		})
		.catch((e: Error) => {
			dbError = e;
			return undefined;
		});

	return { book, dbError };
}
