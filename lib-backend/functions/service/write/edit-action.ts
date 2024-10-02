import { error } from '@sveltejs/kit';
import { dbBookList } from '$lib-backend/model/book/list';

export async function isExistBookUrlSlug(userId: string, inputSlug: string, editingBookId: string) {
	const { books, dbError: dbBookListError } = await dbBookList({
		userId,
		isIncludeDraft: true
	});
	if (!books || dbBookListError) {
		return error(500, { message: dbBookListError?.message ?? '' });
	}
	for (const book of books) {
		if (editingBookId && editingBookId === book.id) {
			continue;
		}
		if (book.url_slug === inputSlug) {
			return true;
		}
	}

	return false;
}
