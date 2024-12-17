import { error } from '@sveltejs/kit';
import { dbBookGet } from '$lib-backend/model/book/get';

export async function isExistBookUrlSlug(
	userKeyHandle: string,
	bookUrlSlug: string,
	editingBookId: string
) {
	const { book, dbError: dbBookListError } = await dbBookGet({
		bookUrlSlug: bookUrlSlug.toLowerCase(),
		userKeyHandle: userKeyHandle.toLowerCase(),
		statuses: [1]
	});
	if (dbBookListError) {
		return error(500, { message: dbBookListError.message });
	}

	return book != undefined && book.id !== editingBookId;
}
