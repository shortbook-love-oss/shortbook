import prisma from '$lib-backend/database/connect';

export interface DbUserDeleteRequest {
	userId: string;
}

export async function dbUserDelete(req: DbUserDeleteRequest) {
	let dbError: Error | undefined;

	await prisma
		.$transaction(async (tx) => {
			const deletedAt = new Date();
			const user = await tx.users.update({
				where: {
					id: req.userId,
					deleted_at: null
				},
				data: { deleted_at: deletedAt }
			});
			if (!user) {
				dbError ??= new Error(`Can't find user. User ID=${req.userId}`);
				throw dbError;
			}

			await tx.user_languages.updateMany({
				where: {
					user_id: user.id,
					deleted_at: null
				},
				data: { deleted_at: deletedAt }
			});
			await tx.user_fans.updateMany({
				where: {
					target_user_id: req.userId,
					deleted_at: null
				},
				data: { deleted_at: deletedAt }
			});
			await tx.user_payment_checkouts.updateMany({
				where: {
					user_id: req.userId,
					deleted_at: null
				},
				data: { deleted_at: deletedAt }
			});
			await tx.user_payment_contracts.updateMany({
				where: {
					user_id: req.userId,
					deleted_at: null
				},
				data: { deleted_at: deletedAt }
			});
			await tx.user_payment_settings.updateMany({
				where: {
					user_id: req.userId,
					deleted_at: null
				},
				data: { deleted_at: deletedAt }
			});
			await tx.user_points.updateMany({
				where: {
					user_id: req.userId,
					deleted_at: null
				},
				data: { deleted_at: deletedAt }
			});
			await tx.book_buys.updateMany({
				where: {
					user_id: req.userId,
					deleted_at: null
				},
				data: { deleted_at: deletedAt }
			});
			await tx.sessions.deleteMany({
				where: { user_id: req.userId }
			});
			await tx.verification_tokens.deleteMany({
				where: { user_id: req.userId }
			});

			const deleteBooks = await tx.books.findMany({
				where: {
					user_id: req.userId,
					deleted_at: null
				},
				select: {
					id: true
				}
			});
			if (deleteBooks.length > 0) {
				const deleteBookIds = deleteBooks.map((item) => item.id);
				await tx.books.updateMany({
					where: {
						user_id: req.userId,
						deleted_at: null
					},
					data: { deleted_at: deletedAt }
				});
				await tx.book_revisions.updateMany({
					where: {
						book_id: { in: deleteBookIds },
						deleted_at: null
					},
					data: { deleted_at: deletedAt }
				});
				await tx.book_translate_languages.updateMany({
					where: {
						book_revision: {
							book_id: { in: deleteBookIds },
							deleted_at: null
						},
						deleted_at: null
					},
					data: { deleted_at: deletedAt }
				});
				await tx.book_contents.updateMany({
					where: {
						book_revision: {
							book_id: { in: deleteBookIds },
							deleted_at: null
						},
						deleted_at: null
					},
					data: { deleted_at: deletedAt }
				});
				await tx.book_covers.updateMany({
					where: {
						book_revision: {
							book_id: { in: deleteBookIds },
							deleted_at: null
						},
						deleted_at: null
					},
					data: { deleted_at: deletedAt }
				});
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to delete user. User ID=${req.userId}`);
			return undefined;
		});

	return { dbError };
}
