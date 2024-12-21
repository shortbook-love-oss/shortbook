import prisma from '$lib-backend/database/connect';
import type { BookCoverCreateProp, BookOverviewCreateProp } from '$lib-backend/model/book/create';
import { isArrayHaveSameValues } from '$lib/utilities/array';

export type DbBookUpdateRequest = BookOverviewCreateProp &
	BookCoverCreateProp & {
		bookId: string;
		isAdmin: boolean;
	};

export async function dbBookUpdate(req: DbBookUpdateRequest) {
	const { bookRevision, dbError } = await prisma
		.$transaction(async (tx) => {
			const bookBeforeEdit = await prisma.books.findUnique({
				where: {
					id: req.bookId,
					deleted_at: null
				}
			});
			if (!bookBeforeEdit) {
				throw new Error(`Can't find book. Book ID=${req.bookId}`);
			} else if (bookBeforeEdit.user_id !== req.userId) {
				throw new Error(`Can't edit book written by other writer. Book ID=${req.bookId}`);
			}

			await tx.books.update({
				where: {
					id: bookBeforeEdit.id,
					deleted_at: null
				},
				data: {
					is_admin: req.isAdmin
				}
			});

			const latestRevision = await tx.book_revisions.findFirst({
				where: {
					book_id: bookBeforeEdit.id,
					deleted_at: null
				},
				orderBy: {
					number: 'desc'
				},
				take: 1
			});
			if (latestRevision == null) {
				throw new Error(`Can't find book revision. Book ID=${req.bookId}`);
			}
			let bookRevision = latestRevision;

			const bookOverviewData = {
				status: req.status,
				url_slug: req.urlSlug,
				buy_point: req.buyPoint,
				native_language_tag: req.nativeLanguage,
				is_translate_to_all: req.isTranslateToAll
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
						revision_id_language_tag: {
							revision_id: latestRevision.id,
							language_tag: latestRevision.native_language_tag
						}
					}
				});
				if (latestContent == null) {
					throw new Error(`Can't find book revision. Book ID=${req.bookId}`);
				}
				bookRevision = await tx.book_revisions.create({
					data: {
						book_id: bookBeforeEdit.id,
						number: latestRevision.number + 1,
						...bookOverviewData,
						title: latestContent.title,
						subtitle: latestContent.subtitle,
						free_area: latestRevision.free_area,
						paid_area: latestRevision.paid_area,
						sales_area: latestRevision.sales_area,
						has_free_area: latestRevision.has_free_area,
						has_paid_area: latestRevision.has_paid_area,
						has_sales_area: latestRevision.has_sales_area,
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
								title: latestContent.title,
								subtitle: latestContent.subtitle,
								free_area_html: latestContent.free_area_html,
								paid_area_html: latestContent.paid_area_html,
								sales_area_html: latestContent.sales_area_html
							}
						}
					}
				});
				revisionId = bookRevision.id;
			} else {
				// If the book is "draft", update latest revision
				bookRevision = await tx.book_revisions.update({
					where: { id: latestRevision.id },
					data: bookOverviewData
				});
				const translateLanguages = await tx.book_translate_languages.findMany({
					where: { revision_id: latestRevision.id },
					select: { language_tag: true }
				});
				const translateLangTags = translateLanguages.map((lang) => lang.language_tag);
				if (!isArrayHaveSameValues(translateLangTags, req.translateLanguages)) {
					if (translateLangTags.length > 0) {
						await tx.book_translate_languages.deleteMany({
							where: { revision_id: latestRevision.id }
						});
					}
					if (req.translateLanguages.length > 0) {
						await tx.book_translate_languages.createMany({
							data: req.translateLanguages.map((langTag) => ({
								revision_id: latestRevision.id,
								language_tag: langTag
							}))
						});
					}
				}
				await tx.book_contents.update({
					where: {
						revision_id_language_tag: {
							revision_id: latestRevision.id,
							language_tag: latestRevision.native_language_tag
						}
					},
					data: { language_tag: req.nativeLanguage }
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

			return { bookRevision, dbError: undefined };
		})
		.catch((e: Error) => {
			console.error(e);
			const dbError = new Error(`Failed to get the book. Book ID=${req.bookId}`);
			return { bookRevision: undefined, dbError };
		});

	return { bookRevision, dbError };
}
