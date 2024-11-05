import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { getBookCover, type BookDraftUpdateResult } from '$lib/utilities/book';
import { getRandom } from '$lib/utilities/crypto';
import { getLanguageTagFromUrl } from '$lib/utilities/url';
import { schema as createSchema } from '$lib/validation/schema/book/draft-create';
import { schema as updateSchema } from '$lib/validation/schema/book/draft-update';
import { dbBookCreate } from '$lib-backend/model/book/create';
import { dbBookGet } from '$lib-backend/model/book/get';
import { dbBookUpdate } from '$lib-backend/model/book/update';

export async function POST({ request, url, locals }) {
	const signInUser = locals.signInUser;
	if (!signInUser) {
		return error(401, { message: 'Unauthorized' });
	}
	const requestLang = getLanguageTagFromUrl(url);

	const form = await superValidate(await request.json(), zod(createSchema));
	if (!form.valid) {
		const errorReasons = Object.values(form.errors).flat().join(', ');
		return error(400, { message: `Bad request. ${errorReasons ?? ''}` });
	}

	const urlSlug = getRandom(16);
	const { book, dbError: dbBookUpdateError } = await dbBookCreate({
		...getBookCover({}),
		userId: signInUser.id,
		status: 0,
		targetLanguage: requestLang,
		title: form.data.title,
		subtitle: form.data.subtitle,
		prologue: form.data.prologue,
		content: form.data.content,
		salesMessage: '',
		urlSlug,
		buyPoint: 0
	});
	if (!book || dbBookUpdateError) {
		return error(500, { message: dbBookUpdateError?.message ?? '' });
	}

	const responseData: BookDraftUpdateResult = {
		bookId: book.id
	};
	const response = new Response(JSON.stringify(responseData));
	response.headers.set('content-type', 'application/json');
	return response;
}

export async function PUT({ request, url, locals }) {
	const signInUser = locals.signInUser;
	if (!signInUser) {
		return error(401, { message: 'Unauthorized' });
	}
	const requestLang = getLanguageTagFromUrl(url);

	const form = await superValidate(await request.json(), zod(updateSchema));
	if (!form.valid) {
		const errorReasons = Object.values(form.errors).flat().join(', ');
		return error(400, { message: `Bad request. ${errorReasons ?? ''}` });
	}

	const {
		book: currentBook,
		bookRevision,
		dbError: dbBookGetError
	} = await dbBookGet({
		bookId: form.data.bookId,
		userId: signInUser.id,
		isIncludeDraft: true
	});
	if (!currentBook || !bookRevision || bookRevision.contents.length === 0 || dbBookGetError) {
		return error(500, { message: dbBookGetError?.message ?? '' });
	}
	let bookLang = bookRevision.contents.find((lang) => lang.target_language === requestLang);
	if (!bookLang) {
		bookLang = bookRevision.contents[0];
	}
	const { dbError: dbBookUpdateError } = await dbBookUpdate({
		...getBookCover({}),
		bookId: currentBook.id,
		userId: signInUser.id,
		status: 0,
		targetLanguage: requestLang,
		title: form.data.title,
		subtitle: form.data.subtitle,
		prologue: form.data.prologue,
		content: form.data.content,
		salesMessage: bookLang.sales_message,
		urlSlug: currentBook.url_slug,
		buyPoint: currentBook.buy_point
	});
	if (dbBookUpdateError) {
		return error(500, { message: dbBookUpdateError?.message ?? '' });
	}

	const responseData: BookDraftUpdateResult = {
		bookId: form.data.bookId
	};
	const response = new Response(JSON.stringify(responseData));
	response.headers.set('content-type', 'application/json');
	return response;
}
