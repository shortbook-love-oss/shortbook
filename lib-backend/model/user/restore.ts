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

			const deletedBooks = await tx.books.findMany({
				where: {
					user_id: req.userId
				},
				select: {
					id: true
				}
			});
			if (deletedBooks.length > 0) {
				const deletedBookIds = deletedBooks.map((item) => item.id);
				await tx.books.updateMany({
					where: {
						user_id: req.userId
					},
					data: { deleted_at: null }
				});
				await tx.book_revisions.updateMany({
					where: {
						book_id: { in: deletedBookIds }
					},
					data: { deleted_at: null }
				});
				await tx.book_translate_languages.updateMany({
					where: {
						book_revision: {
							book_id: { in: deletedBookIds }
						}
					},
					data: { deleted_at: null }
				});
				await tx.book_contents.updateMany({
					where: {
						book_revision: {
							book_id: { in: deletedBookIds }
						}
					},
					data: { deleted_at: null }
				});
				await tx.book_covers.updateMany({
					where: {
						book_revision: {
							book_id: { in: deletedBookIds }
						}
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
