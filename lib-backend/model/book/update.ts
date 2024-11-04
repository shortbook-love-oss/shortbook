import prisma from '$lib-backend/database/connect';
import type { DbBookCreateRequest } from '$lib-backend/model/book/create';

export interface DbBookUpdateRequest extends DbBookCreateRequest {
	bookId: string;
	revision: number;
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
					url_slug: req.urlSlug,
					status: req.status,
					buy_point: req.buyPoint,
					published_at: publishedAt
				}
			});
			if (!book) {
				dbError ??= new Error(`Can't find book. Book ID=${req.bookId}`);
				throw dbError;
			}

			let revisionId = '';
			const revision = await tx.book_revisions.findUnique({
				where: {
					book_id_revision: {
						book_id: book.id,
						revision: req.revision
					}
				}
			});
			if (req.revision === 0) {
				// 1. Get maximum revison number of the book
				const previosRevision = await tx.book_revisions.aggregate({
					where: { book_id: book.id },
					_max: { revision: true }
				});
				const previosRevisionNo = previosRevision._max.revision;
				if (previosRevisionNo == null) {
					dbError ??= new Error(`Can't find book revision. Book ID=${req.bookId}`);
					throw dbError;
				}
				// 2. Give the latest revision an incremented number and save it as a past revision
				await tx.book_revisions.update({
					where: {
						book_id_revision: {
							book_id: book.id,
							revision: 0
						}
					},
					data: {
						book_id: book.id,
						revision: previosRevisionNo + 1
					}
				});
				// 3. Create new revision as latest revision
				const newRevision = await tx.book_revisions.create({
					data: {
						book_id: book.id,
						revision: 0
					}
				});
				if (!newRevision) {
					dbError ??= new Error(`Can't create book revision. Book ID=${req.bookId}`);
					throw dbError;
				}
				revisionId = newRevision.id;
			} else {
				if (!revision) {
					dbError ??= new Error(
						`Can't find book revision. Book ID=${req.bookId}, Revision=${req.revision}`
					);
					throw dbError;
				}
				revisionId = revision.id;
			}

			await tx.book_covers.update({
				where: {
					revision_id: revisionId
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
