import { error } from '@sveltejs/kit';
import { dbBookList } from '$lib/model/book/list';

export async function isExistBookKeyName(
	userId: string,
	inputKeyName: string,
	editingBookId: string
) {
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
		if (book.key_name === inputKeyName) {
			return true;
		}
	}

	return false;
}
