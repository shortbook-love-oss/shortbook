import prisma from '$lib-backend/database/connect';
import type { DbBookCreateRequest } from '$lib-backend/model/book/create';

export interface DbBookUpdateRequest extends DbBookCreateRequest {
	bookId: string;
}

export async function dbBookUpdate(req: DbBookUpdateRequest) {
	let dbError: Error | undefined;

	const bookBeforeEdit = await prisma.books.findUnique({
		select: {
			user_id: true
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

	const book = await prisma
		.$transaction(async (tx) => {
			const book = await tx.books.findUnique({
				where: {
					id: req.bookId,
					deleted_at: null
				}
			});
			if (!book) {
				dbError ??= new Error(`Can't find book. Book ID=${req.bookId}`);
				throw dbError;
			}

			const latestRevision = await tx.book_revisions.findFirst({
				where: {
					book_id: book.id,
					deleted_at: null
				},
				orderBy: {
					number: 'desc'
				},
				take: 1,
				select: {
					id: true,
					number: true,
					status: true
				}
			});
			if (latestRevision == null) {
				dbError ??= new Error(`Can't find book revision. Book ID=${req.bookId}`);
				throw dbError;
			}

			let revisionId = latestRevision.id;
			if (latestRevision.status !== 0) {
				// If the book isn't "draft", create new revision
				const newRevision = await tx.book_revisions.create({
					data: {
						book_id: book.id,
						number: latestRevision.number + 1,
						status: req.status,
						url_slug: req.urlSlug,
						buy_point: req.buyPoint,
						native_language: req.targetLanguage
					}
				});
				if (!newRevision) {
					dbError ??= new Error(`Can't create a new revision. Book ID=${req.bookId}`);
					throw dbError;
				}
				revisionId = newRevision.id;
			} else {
				// If the book is "draft", update latest revision
				await tx.book_revisions.update({
					where: { id: latestRevision.id },
					data: {
						status: req.status,
						url_slug: req.urlSlug,
						buy_point: req.buyPoint,
						native_language: req.targetLanguage
					}
				});
			}

			const bookCoverData = {
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
			};
			await tx.book_covers.upsert({
				where: {
					revision_id: revisionId
				},
				create: {
					...bookCoverData,
					revision_id: revisionId
				},
				update: bookCoverData
			});

			await tx.book_contents.deleteMany({
				where: {
					revision_id: revisionId
				}
			});
			await tx.book_contents.createMany({
				data: [
					{
						revision_id: revisionId,
						target_language: req.targetLanguage,
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
