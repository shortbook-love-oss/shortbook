import prisma from '$lib-backend/database/connect';

export type BookOverviewCreateProp = {
	userId: string;
	status: number; // 0: Draft 1: Public
	targetLanguage: string;
	urlSlug: string;
	buyPoint: number;
};

export type BookCoverCreateProp = {
	baseColorStart: string;
	baseColorEnd: string;
	baseColorDirection: number;
	titleFontSize: number;
	titleAlign: string;
	titleColor: string;
	subtitleFontSize: number;
	subtitleAlign: string;
	subtitleColor: string;
	writerAlign: string;
	writerColor: string;
};

export type BookContentCreateProp = {
	title: string;
	subtitle: string;
	freeArea: string;
	paidArea: string;
	salesArea: string;
	freeAreaHtml: string;
	paidAreaHtml: string;
	salesAreaHtml: string;
	hasFreeArea: boolean;
	hasPaidArea: boolean;
	hasSalesArea: boolean;
};

export async function dbBookCreate(
	req: BookOverviewCreateProp & BookCoverCreateProp & BookContentCreateProp
) {
	let dbError: Error | undefined;

	const book = await prisma
		.$transaction(async (tx) => {
			const book = await tx.books.create({
				data: {
					user_id: req.userId,
					revisions: {
						create: {
							number: 1,
							status: req.status,
							url_slug: req.urlSlug,
							buy_point: req.buyPoint,
							native_language: req.targetLanguage,
							has_free_area: req.hasFreeArea,
							has_paid_area: req.hasPaidArea,
							has_sales_area: req.hasSalesArea,
							cover: {
								create: {
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
							},
							contents: {
								create: {
									target_language: req.targetLanguage,
									title: req.title,
									subtitle: req.subtitle,
									free_area: req.freeArea,
									paid_area: req.paidArea,
									sales_area: req.salesArea,
									free_area_html: req.freeAreaHtml,
									paid_area_html: req.paidAreaHtml,
									sales_area_html: req.salesAreaHtml
								}
							}
						}
					}
				}
			});

			return book;
		})
		.catch(() => {
			dbError ??= new Error(`Failed to create book. User ID=${req.userId}`);
			return undefined;
		});

	return { book, dbError };
}
