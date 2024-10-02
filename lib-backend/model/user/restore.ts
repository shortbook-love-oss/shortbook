import prisma from '$lib-backend/database/connect';

export interface DbUserRestoreRequest {
	userId: string;
}

export async function dbUserRestore(req: DbUserRestoreRequest) {
	let dbError: Error | undefined;

	await prisma
		.$transaction(async (tx) => {
			const user = await tx.users.update({
				where: {
					id: req.userId
				},
				data: { deleted_at: null }
			});
			if (!user) {
				dbError ??= new Error(`Can't find user. User ID=${req.userId}`);
				throw dbError;
			}

			await tx.user_languages.updateMany({
				where: {
					user_id: user.id
				},
				data: { deleted_at: null }
			});
			await tx.user_fans.updateMany({
				where: {
					target_user_id: req.userId
				},
				data: { deleted_at: null }
			});
			await tx.user_payment_checkouts.updateMany({
				where: {
					user_id: req.userId
				},
				data: { deleted_at: null }
			});
			await tx.user_payment_contracts.updateMany({
				where: {
					user_id: req.userId
				},
				data: { deleted_at: null }
			});
			await tx.user_payment_settings.updateMany({
				where: {
					user_id: req.userId
				},
				data: { deleted_at: null }
			});
			await tx.user_points.updateMany({
				where: {
					user_id: req.userId
				},
				data: { deleted_at: null }
			});
			await tx.book_buys.updateMany({
				where: {
					user_id: req.userId
				},
				data: { deleted_at: null }
			});

			const deleteBooks = await tx.books.findMany({
				where: {
					user_id: req.userId
				},
				select: {
					id: true
				}
			});
			const deleteBookIds = deleteBooks.map((item) => item.id);
			if (deleteBookIds.length) {
				await tx.books.updateMany({
					where: {
						user_id: req.userId
					},
					data: { deleted_at: null }
				});
				await tx.book_covers.updateMany({
					where: {
						book_id: { in: deleteBookIds }
					},
					data: { deleted_at: null }
				});
				await tx.book_languages.updateMany({
					where: {
						book_id: { in: deleteBookIds }
					},
					data: { deleted_at: null }
				});
				await tx.book_tags.updateMany({
					where: {
						book_id: { in: deleteBookIds }
					},
					data: { deleted_at: null }
				});
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to restore user. User ID=${req.userId}`);
			return undefined;
		});

	return { dbError };
}
