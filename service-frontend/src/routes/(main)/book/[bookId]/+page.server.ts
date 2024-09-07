import { error, redirect } from '@sveltejs/kit';
import { dbBookGet } from '$lib-backend/model/book/get';
import { setLanguageTagToPath } from '$lib/utilities/url';

export const load = async ({ url, params }) => {
	const { book, dbError } = await dbBookGet({
		bookId: params.bookId,
		isIncludeDelete: true,
		isIncludeDraft: true
	});
	if (dbError || !book?.user?.profiles) {
		return error(404, { message: 'Not found' });
	}

	const userKeyName = book.user.profiles.key_name;

	redirect(301, setLanguageTagToPath(`/@${userKeyName}/book/${book.key_name}${url.search}`, url));
};
