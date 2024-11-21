import prisma from '$lib-backend/database/connect';
import type { BookCoverCreateProp, BookOverviewCreateProp } from '$lib-backend/model/book/create';

export type DbBookUpdateRequest = BookOverviewCreateProp & BookCoverCreateProp & { bookId: string };

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
				take: 1
			});
			if (latestRevision == null) {
				dbError ??= new Error(`Can't find book revision. Book ID=${req.bookId}`);
				throw dbError;
			}

			const bookOverviewData = {
				status: req.status,
				url_slug: req.urlSlug,
				buy_point: req.buyPoint,
				native_language: req.targetLanguage
			};
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

			let revisionId = latestRevision.id;
			if (latestRevision.status !== 0) {
				// If the book isn't "draft", create new revision
				const latestContent = await tx.book_contents.findUnique({
					where: {
						revision_id_target_language: {
							revision_id: latestRevision.id,
							target_language: latestRevision.native_language
						}
					}
				});
				if (latestContent == null) {
					dbError ??= new Error(`Can't find book revision. Book ID=${req.bookId}`);
					throw dbError;
				}
				const newRevision = await tx.book_revisions.create({
					data: {
						book_id: book.id,
						number: latestRevision.number + 1,
						...bookOverviewData,
						has_free_area: latestRevision.has_free_area,
						has_paid_area: latestRevision.has_paid_area,
						has_sales_area: latestRevision.has_sales_area,
						contents: {
							create: {
								target_language: req.targetLanguage,
								title: latestContent.title,
								subtitle: latestContent.subtitle,
								free_area: latestContent.free_area,
								paid_area: latestContent.paid_area,
								sales_area: latestContent.sales_area,
								free_area_html: latestContent.free_area_html,
								paid_area_html: latestContent.paid_area_html,
								sales_area_html: latestContent.sales_area_html
							}
						}
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
					data: bookOverviewData
				});
				await tx.book_contents.update({
					where: {
						revision_id_target_language: {
							revision_id: latestRevision.id,
							target_language: latestRevision.native_language
						}
					},
					data: { target_language: req.targetLanguage }
				});
			}

			await tx.book_covers.upsert({
				where: {
					revision_id: revisionId
				},
				create: {
					revision_id: revisionId,
					...bookCoverData
				},
				update: bookCoverData
			});

			if (book) return book;
		})
		.catch(() => {
			dbError ??= new Error(`Failed to get book. Book ID=${req.bookId}`);
			return undefined;
		});

	return { book, dbError };
}
