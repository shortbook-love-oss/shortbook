import prisma from '$lib-backend/database/connect';
import type { DbBookCreateRequest } from './create';

export interface DbBookUpdateRequest extends DbBookCreateRequest {
	bookId: string;
}

export async function dbBookUpdate(req: DbBookUpdateRequest) {
	let dbError: Error | undefined;

	const bookBeforeEdit = await prisma.books.findUnique({
		select: {
			user_id: true,
			published_at: true
		},
		where: {
			id: req.bookId,
			deleted_at: null
		}
	});
	if (!bookBeforeEdit) {
		dbError ??= new Error(`Can't find book. Book ID=${req.bookId}`);
		return { dbError };
	} else if (bookBeforeEdit.user_id !== req.userId) {
		dbError ??= new Error(`Can't edit book written by other writer. Book ID=${req.bookId}`);
		return { dbError };
	}

	let publishedAt = new Date();
	if (req.status === 0) {
		publishedAt = bookBeforeEdit.published_at;
	}

	const book = await prisma
		.$transaction(async (tx) => {
			const book = await tx.books.update({
				where: {
					id: req.bookId,
					deleted_at: null
				},
				data: {
					key_name: req.keyName,
					status: req.status,
					buy_point: req.buyPoint,
					published_at: publishedAt
				}
			});
			if (!book?.id) {
				dbError ??= new Error(`Can't find book. Book ID=${req.bookId}`);
				throw dbError;
			}

			await tx.book_covers.update({
				where: {
					book_id: book.id
				},
				data: {
					base_color_start: req.baseColorStart,
					base_color_end: req.baseColorEnd,
					base_color_direction: req.baseColorDirection,
					title_font_size: req.titleFontSize,
					title_align: req.titleAlign,
					title_color: req.titleColor,
					subtitle_font_size: req.subtitleFontSize,
					subtitle_align: req.subtitleAlign,
					subtitle_color: req.subtitleColor,
					writer_align: req.writerAlign,
					writer_color: req.writerColor
				}
			});

			await tx.book_languages.deleteMany({
				where: {
					book_id: book.id
				}
			});
			await tx.book_languages.createMany({
				data: [
					{
						book_id: book.id,
						language_code: req.nativeLanguage,
						thumbnail_url: '',
						title: req.title,
						subtitle: req.subtitle,
						prologue: req.prologue,
						content: req.content,
						sales_message: req.salesMessage
					}
				]
			});

			return book;
		})
		.catch(() => {
			dbError ??= new Error(`Failed to get book. Book ID=${req.bookId}`);
			return undefined;
		});

	return { book, dbError };
}
