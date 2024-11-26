import { error } from '@sveltejs/kit';
import type { SerializedEditorState } from 'lexical';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { getBookCover, type BookDraftUpdateResult } from '$lib/utilities/book';
import { getRandom } from '$lib/utilities/crypto';
import type { AvailableLanguageTags } from '$lib/utilities/language';
import { getLanguageTagFromUrl } from '$lib/utilities/url';
import { schema as createSchema } from '$lib/validation/schema/book/draft-create';
import { schema as updateSchema } from '$lib/validation/schema/book/draft-update';
import { dbBookRevisionCreate } from '$lib-backend/model/book/revision/create';
import { dbBookRevisionUpdate } from '$lib-backend/model/book/revision/update';
import {
	dbBookCreate,
	type BookContentCreateProp,
	type BookOverviewCreateProp
} from '$lib-backend/model/book/create';
import { dbBookGet } from '$lib-backend/model/book/get';
import { fromEditorStateToHtml } from '$lib-backend/utilities/book';

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
	const { html: freeAreaHtml, hasContent: hasFreeArea } = await fromEditorStateToHtml(
		form.data.freeArea as unknown as SerializedEditorState
	);
	const { html: paidAreaHtml, hasContent: hasPaidArea } = await fromEditorStateToHtml(
		form.data.paidArea as unknown as SerializedEditorState
	);
	const { html: salesAreaHtml, hasContent: hasSalesArea } = await fromEditorStateToHtml(
		form.data.salesArea as unknown as SerializedEditorState
	);
	const { book, dbError: dbBookUpdateError } = await dbBookCreate({
		...getBookCover({}),
		userId: signInUser.id,
		status: 0,
		urlSlug,
		buyPoint: 200,
		targetLanguage: requestLang,
		isTranslateToAll: true,
		translateLanguages: [],
		title: form.data.title,
		subtitle: form.data.subtitle,
		freeArea: JSON.stringify(form.data.freeArea),
		paidArea: JSON.stringify(form.data.paidArea),
		salesArea: JSON.stringify(form.data.salesArea),
		freeAreaHtml,
		paidAreaHtml,
		salesAreaHtml,
		hasFreeArea,
		hasPaidArea,
		hasSalesArea
	});
	if (!book || dbBookUpdateError) {
		return error(500, { message: dbBookUpdateError?.message ?? '' });
	}

	const responseData: BookDraftUpdateResult = { bookId: book.id };
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
		userId: signInUser.id
	});
	if (!currentBook || !bookRevision || bookRevision.contents.length === 0 || dbBookGetError) {
		return error(500, { message: dbBookGetError?.message ?? '' });
	}

	const { html: freeAreaHtml, hasContent: hasFreeArea } = await fromEditorStateToHtml(
		form.data.freeArea as unknown as SerializedEditorState
	);
	const { html: paidAreaHtml, hasContent: hasPaidArea } = await fromEditorStateToHtml(
		form.data.paidArea as unknown as SerializedEditorState
	);
	const { html: salesAreaHtml, hasContent: hasSalesArea } = await fromEditorStateToHtml(
		form.data.salesArea as unknown as SerializedEditorState
	);

	const bookRevisionUpsertParam: BookOverviewCreateProp & BookContentCreateProp = {
		userId: signInUser.id,
		status: 0,
		urlSlug: bookRevision.url_slug,
		buyPoint: bookRevision.buy_point,
		targetLanguage: requestLang,
		isTranslateToAll: bookRevision.is_translate_to_all,
		translateLanguages: bookRevision.translate_languages.map(
			(lang) => lang.target_language as AvailableLanguageTags
		),
		title: form.data.title,
		subtitle: form.data.subtitle,
		freeArea: JSON.stringify(form.data.freeArea),
		paidArea: JSON.stringify(form.data.paidArea),
		salesArea: JSON.stringify(form.data.salesArea),
		freeAreaHtml,
		paidAreaHtml,
		salesAreaHtml,
		hasFreeArea,
		hasPaidArea,
		hasSalesArea
	};
	if (bookRevision.status !== 0) {
		const { dbError: dbRevCreateError } = await dbBookRevisionCreate({
			...bookRevisionUpsertParam,
			bookId: currentBook.id
		});
		if (dbRevCreateError) {
			return error(500, { message: dbRevCreateError.message });
		}
	} else {
		const { dbError: dbRevUpdateError } = await dbBookRevisionUpdate({
			...bookRevisionUpsertParam,
			revisionId: bookRevision.id
		});
		if (dbRevUpdateError) {
			return error(500, { message: dbRevUpdateError.message });
		}
	}

	const responseData: BookDraftUpdateResult = { bookId: form.data.bookId };
	const response = new Response(JSON.stringify(responseData));
	response.headers.set('content-type', 'application/json');
	return response;
}
