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
				await tx.article_languages.updateMany({
					where: { article_id: { in: deleteArticleIds } },
					data: { deleted_at: deletedAt }
				});
				await tx.article_tags.updateMany({
					where: { article_id: { in: deleteArticleIds } },
					data: { deleted_at: deletedAt }
				});
				// Don't soft delete article_buys
				await tx.article_favorites.updateMany({
					where: { article_id: { in: deleteArticleIds } },
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
