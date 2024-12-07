import prisma from '$lib-backend/database/connect';
import type { BookContentCreateProp, BookOverviewCreateProp } from '$lib-backend/model/book/create';

export type DbBookRevisionCreateRequest = BookOverviewCreateProp &
	BookContentCreateProp & { bookId: string };

export async function dbBookRevisionCreate(req: DbBookRevisionCreateRequest) {
	let dbError: Error | undefined;

	if (req.userId) {
		const bookBeforeEdit = await prisma.books.findUnique({
			where: {
				id: req.bookId,
				deleted_at: null
			},
			select: { user_id: true }
		});
		if (!bookBeforeEdit) {
			dbError ??= new Error(`Can't find book. Book ID=${req.bookId}`);
			return { dbError };
		} else if (bookBeforeEdit.user_id !== req.userId) {
			dbError ??= new Error(`Can't edit book written by other writer. Book ID=${req.bookId}`);
			return { dbError };
		}
	}

	const bookRevision = await prisma
		.$transaction(async (tx) => {
			const book = await tx.books.findUnique({
				where: {
					id: req.bookId,
					deleted_at: null
				},
				select: {
					id: true,
					revisions: {
						where: { deleted_at: null },
						orderBy: { number: 'desc' },
						take: 1,
						select: {
							id: true,
							number: true,
							cover: {
								where: { deleted_at: null },
								omit: {
									id: true,
									revision_id: true,
									created_at: true,
									updated_at: true,
									deleted_at: true
								}
							}
						}
					}
				}
			});
			if (!book) {
				dbError ??= new Error(`Can't find book. Book ID=${req.bookId}`);
				throw dbError;
			}

			const latestRevision = book.revisions.at(0);
			const latestCover = latestRevision?.cover;
			if (latestRevision == null || latestCover == null) {
				dbError ??= new Error(`Can't find book revision. Book ID=${req.bookId}`);
				throw dbError;
			}

			const bookRevision = await tx.book_revisions.create({
				data: {
					book_id: book.id,
					number: latestRevision.number + 1,
					status: req.status,
					url_slug: req.urlSlug,
					buy_point: req.buyPoint,
					native_language_tag: req.nativeLanguage,
					is_translate_to_all: req.isTranslateToAll,
					title: req.title,
					subtitle: req.subtitle,
					free_area: req.freeArea,
					paid_area: req.paidArea,
					sales_area: req.salesArea,
					has_free_area: req.hasFreeArea,
					has_paid_area: req.hasPaidArea,
					has_sales_area: req.hasSalesArea,
					translate_languages: {
						createMany: {
							data: req.translateLanguages.map((langTag) => ({
								language_tag: langTag
							}))
						}
					},
					contents: {
						create: {
							language_tag: req.nativeLanguage,
							title: req.title,
							subtitle: req.subtitle,
							free_area_html: req.freeAreaHtml,
							paid_area_html: req.paidAreaHtml,
							sales_area_html: req.salesAreaHtml
						}
					},
					cover: { create: latestCover }
				}
			});

			return bookRevision;
		})
		.catch(() => {
			dbError ??= new Error(`Failed to get book. Book ID=${req.bookId}`);
			return undefined;
		});

	return { bookRevision, dbError };
}
