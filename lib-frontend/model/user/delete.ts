import prisma from '$lib/prisma/connect';

export interface DbUserDeleteRequest {
	userId: string;
}

export async function dbUserDelete(req: DbUserDeleteRequest) {
	let dbError: Error | undefined;

	await prisma
		.$transaction(async (tx) => {
			const deletedAt = new Date();
			await tx.user.update({
				where: { id: req.userId },
				data: { deleted_at: deletedAt }
			});
			const deletedProfile = await tx.user_profiles.update({
				where: { user_id: req.userId },
				data: { deleted_at: deletedAt }
			});
			if (!deletedProfile?.id) {
				throw new Error(`Can't find user of id=${req.userId}.`);
			}

			await tx.user_profile_langs.updateMany({
				where: { profile_id: deletedProfile.id },
				data: { deleted_at: deletedAt }
			});
			await tx.user_fans.updateMany({
				where: { target_user_id: req.userId },
				data: { deleted_at: deletedAt }
			});
			await tx.authenticator.deleteMany({
				where: { userId: req.userId }
			});
			await tx.session.deleteMany({
				where: { userId: req.userId }
			});

			const deleteArticles = await tx.user_profiles.findMany({
				where: { user_id: req.userId }
			});
			const deleteArticleIds = deleteArticles.map((item) => item.id);
			if (deleteArticleIds.length) {
				await tx.user_profiles.updateMany({
					where: { user_id: req.userId },
					data: { deleted_at: deletedAt }
				});
				await tx.book_languages.updateMany({
					where: { book_id: { in: deleteArticleIds } },
					data: { deleted_at: deletedAt }
				});
				await tx.book_tags.updateMany({
					where: { book_id: { in: deleteArticleIds } },
					data: { deleted_at: deletedAt }
				});
				// Don't delete book_buys
				await tx.book_favorites.updateMany({
					where: { book_id: { in: deleteArticleIds } },
					data: { deleted_at: deletedAt }
				});
			}
		})
		.catch((e: Error) => {
			dbError = e;
			return undefined;
		});

	return { dbError };
}
