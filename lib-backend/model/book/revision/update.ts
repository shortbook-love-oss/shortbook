import prisma from '$lib-backend/database/connect';
import type { BookContentCreateProp, BookOverviewCreateProp } from '$lib-backend/model/book/create';

export type DbBookRevisionUpdateRequest = BookOverviewCreateProp &
	BookContentCreateProp & { revisionId: string };

export async function dbBookRevisionUpdate(req: DbBookRevisionUpdateRequest) {
	let dbError: Error | undefined;

	if (req.userId) {
		const bookBeforeEdit = await prisma.books.findFirst({
			where: {
				revisions: {
					some: {
						id: req.revisionId,
						deleted_at: null
					}
				},
				deleted_at: null
			},
			select: {
				id: true,
				user_id: true
			}
		});
		if (!bookBeforeEdit) {
			dbError ??= new Error(`Can't find book. Revision ID=${req.revisionId}`);
			return { dbError };
		} else if (bookBeforeEdit.user_id !== req.userId) {
			dbError ??= new Error(
				`Can't edit book written by other writer. Book ID=${bookBeforeEdit.id}`
			);
			return { dbError };
		}
	}

	const bookRevision = await prisma
		.$transaction(async (tx) => {
			// let revisionId = latestRevision.id;
			const bookRevision = await tx.book_revisions.update({
				where: { id: req.revisionId },
				data: {
					status: req.status,
					url_slug: req.urlSlug,
					buy_point: req.buyPoint,
					native_language: req.targetLanguage,
					title: req.title,
					subtitle: req.subtitle,
					free_area: req.freeArea,
					paid_area: req.paidArea,
					sales_area: req.salesArea,
					has_free_area: req.hasFreeArea,
					has_paid_area: req.hasPaidArea,
					has_sales_area: req.hasSalesArea
				},
				select: {
					contents: {
						select: { id: true }
					}
				}
			});

			const bookContent = bookRevision.contents[0];
			if (!bookContent) {
				dbError ??= new Error(`Can't find the book content. Book-revision ID=${req.revisionId}`);
				throw dbError;
			}
			await tx.book_contents.update({
				where: { id: bookContent.id },
				data: {
					revision_id: req.revisionId,
					title: req.title,
					subtitle: req.subtitle,
					free_area_html: req.freeAreaHtml,
					paid_area_html: req.paidAreaHtml,
					sales_area_html: req.salesAreaHtml
				}
			});

			return bookRevision;
		})
		.catch(() => {
			dbError ??= new Error(`Failed to get book. Book-revision ID=${req.revisionId}`);
			return undefined;
		});

	return { bookRevision, dbError };
}
