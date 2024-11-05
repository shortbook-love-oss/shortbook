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
			const book = await tx.books.update({
				where: {
					id: req.bookId,
					deleted_at: null
				},
				data: {
					url_slug: req.urlSlug,
					buy_point: req.buyPoint
				}
			});
			if (!book) {
				dbError ??= new Error(`Can't find book. Book ID=${req.bookId}`);
				throw dbError;
			}

			let revisionId = '';
			if (!Number.isFinite(req.revision)) {
				// 1. Get maximum revison number of the book
				const previosRevision = await tx.book_revisions.aggregate({
					where: {
						book_id: book.id,
						deleted_at: null
					},
					_max: { number: true }
				});
				const previosRevisionNo = previosRevision._max.number;
				if (previosRevisionNo == null) {
					dbError ??= new Error(`Can't find book revision. Book ID=${req.bookId}`);
					throw dbError;
				}
				// 2. Give the latest revision an incremented number and save it as a past revision
				await tx.book_revisions.update({
					where: {
						book_id_number: {
							book_id: book.id,
							number: 0
						}
					},
					data: {
						book_id: book.id,
						number: previosRevisionNo + 1
					}
				});
				// 3. Create new revision as latest revision
				const newRevision = await tx.book_revisions.create({
					data: {
						book_id: book.id,
						number: 0,
						status: req.status
					}
				});
				if (!newRevision) {
					dbError ??= new Error(`Can't create book revision. Book ID=${req.bookId}`);
					throw dbError;
				}
				revisionId = newRevision.id;
			} else {
				const revision = await tx.book_revisions.findUnique({
					where: {
						book_id_number: {
							book_id: book.id,
							number: req.revision
						},
						deleted_at: null
					},
					select: {
						id: true,
						cover: {
							select: { id: true }
						},
						contents: {
							select: { id: true }
						}
					}
				});
				if (!revision || !revision.cover || revision.contents.length === 0) {
					dbError ??= new Error(
						`Can't find book revision. Book ID=${req.bookId}, Revision=${req.revision}`
					);
					throw dbError;
				}
				revisionId = revision.id;
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
