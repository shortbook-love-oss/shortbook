import { error } from '@sveltejs/kit';
import { dbBookList } from '$lib-backend/model/book/list';

export async function isExistBookUrlSlug(userId: string, inputSlug: string, editingBookId: string) {
	const { books, dbError: dbBookListError } = await dbBookList({
		userId,
		statuses: [1]
	});
	if (!books || dbBookListError) {
		return error(500, { message: dbBookListError?.message ?? '' });
	}
	for (const book of books) {
		if (editingBookId && editingBookId === book.id) {
			continue;
		}
		if (book.revisions[0]?.url_slug === inputSlug) {
			return true;
		}
	}

	return false;
}
