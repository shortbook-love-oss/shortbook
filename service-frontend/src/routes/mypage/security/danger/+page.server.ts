import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import prisma from '$lib/prisma/connect';
import { getUserId, keyUserId } from '$lib/utilities/cookie.js';
import { schema } from '$lib/validation/schema/user-delete';

export const load = async ({ cookies }) => {
	const userProfile = await prisma.user_profiles.findFirst({
		where: { user_id: cookies.get(keyUserId) },
		include: { langs: true }
	});

	const penName = userProfile?.langs[0]?.pen_name ?? '';
	const form = await superValidate(zod(schema));
	form.data.slug = userProfile?.slug ?? '';

	return { form, penName };
};

export const actions = {
	default: async ({ request, cookies }) => {
		const form = await superValidate(request, zod(schema));
		if (!form.valid) {
			return fail(400, { form });
		}
		const userId = getUserId(cookies);
		if (!userId) {
			return fail(401, { message: 'Unauthorized' });
		}

		await prisma.$transaction(async (tx) => {
			const deletedAt = new Date();
			await tx.user.update({
				where: { id: userId },
				data: { deleted_at: deletedAt }
			});
			const deletedProfile = await tx.user_profiles.update({
				where: { user_id: userId },
				data: { deleted_at: deletedAt }
			});
			await tx.user_profile_langs.updateMany({
				where: { profile_id: deletedProfile.id },
				data: { deleted_at: deletedAt }
			});
			await tx.user_fans.updateMany({
				where: { target_user_id: userId },
				data: { deleted_at: deletedAt }
			});
			await tx.authenticator.deleteMany({
				where: { userId: userId }
			});
			await tx.session.deleteMany({
				where: { userId: userId }
			});
			const deleteArticles = await tx.user_profiles.findMany({
				where: { user_id: userId }
			});
			const deleteArticleIds = deleteArticles.map((item) => item.id);
			await tx.user_profiles.updateMany({
				where: { user_id: userId },
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
		});

		return message(form, 'User deleted successfully.');
	}
};
