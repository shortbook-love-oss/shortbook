import prisma from '$lib-backend/database/connect';

export interface DbBookCreateRequest {
	userId: string;
	status: number; // 0: Draft 1: Public
	targetLanguage: string;
	title: string;
	subtitle: string;
	prologue: string;
	content: string;
	salesMessage: string;
	urlSlug: string;
	buyPoint: number;
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
}

export async function dbBookCreate(req: DbBookCreateRequest) {
	let dbError: Error | undefined;

	const book = await prisma
		.$transaction(async (tx) => {
			const book = await tx.books.create({
				data: {
					user_id: req.userId,
					url_slug: req.urlSlug,
					buy_point: req.buyPoint,
					native_language: req.targetLanguage,
					revisions: {
						create: {
							number: 1,
							status: req.status,
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
									thumbnail_url: '',
									title: req.title,
									subtitle: req.subtitle,
									prologue: req.prologue,
									content: req.content,
									sales_message: req.salesMessage
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
