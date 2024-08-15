import prisma from '$lib/prisma/connect';

export interface DbUserDeleteRequest {
	userId: string;
}

export async function dbUserDelete(req: DbUserDeleteRequest) {
	let dbError: Error | undefined;

	await prisma
		.$transaction(async (tx) => {
			const deletedAt = new Date();
			const user = await tx.user.update({
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
			const deletedProfile = await tx.user_profiles.update({
				where: {
					user_id: req.userId,
					deleted_at: null
				},
				data: { deleted_at: deletedAt }
			});
			if (!deletedProfile?.id) {
				dbError ??= new Error(`Can't find user. User ID=${req.userId}`);
				throw dbError;
			}

			await tx.account.updateMany({
				where: {
					userId: req.userId,
					deleted_at: null
				},
				data: { deleted_at: deletedAt }
			});
			await tx.user_profile_languages.updateMany({
				where: {
					profile_id: deletedProfile.id,
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
			await tx.authenticator.deleteMany({
				where: { userId: req.userId }
			});
			await tx.session.deleteMany({
				where: { userId: req.userId }
			});
			await tx.verificationToken.deleteMany({
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
			const deleteBookIds = deleteBooks.map((item) => item.id);
			if (deleteBookIds.length) {
				await tx.books.updateMany({
					where: {
						user_id: req.userId,
						deleted_at: null
					},
					data: { deleted_at: deletedAt }
				});
				await tx.book_covers.updateMany({
					where: {
						book_id: { in: deleteBookIds },
						deleted_at: null
					},
					data: { deleted_at: deletedAt }
				});
				await tx.book_languages.updateMany({
					where: {
						book_id: { in: deleteBookIds },
						deleted_at: null
					},
					data: { deleted_at: deletedAt }
				});
				await tx.book_tags.updateMany({
					where: {
						book_id: { in: deleteBookIds },
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
