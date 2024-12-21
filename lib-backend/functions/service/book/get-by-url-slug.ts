import type { AvailableLanguageTags } from '$lib/utilities/language';
import { dbBookGet } from '$lib-backend/model/book/get';

export async function getBookByUrlSlug(
	userKeyHandle: string,
	bookUrlSlug: string,
	requestLang: AvailableLanguageTags
) {
	const {
		book,
		bookRevision,
		dbError: dbBookGetError
	} = await dbBookGet({
		bookUrlSlug: bookUrlSlug.toLowerCase(),
		userKeyHandle: userKeyHandle.toLowerCase(),
		statuses: [1],
		contentsLanguage: requestLang,
		isIncludeDelete: true
	});
	if (dbBookGetError) {
		return { errorMessage: dbBookGetError.message };
	} else if (!book || !bookRevision) {
		return { errorMessage: `Can't find the book. Book Slug=${bookUrlSlug}` };
	}

	const bookNativeLang = bookRevision.native_language_tag as AvailableLanguageTags;
	let isFallbackBookLang = false;
	let bookLang = bookRevision.contents.at(0);
	if (!bookLang) {
		const { bookRevision: nativeBookRevision, dbError: dbBookGetError } = await dbBookGet({
			bookId: book.id,
			statuses: [1],
			contentsLanguage: bookRevision.native_language_tag as AvailableLanguageTags,
			isIncludeDelete: true
		});
		if (dbBookGetError) {
			return { errorMessage: dbBookGetError.message };
		} else if (!nativeBookRevision) {
			return { errorMessage: `Can't find the book. Book Slug=${bookUrlSlug}` };
		}
		isFallbackBookLang = true;
		bookLang = nativeBookRevision.contents.at(0);
	}
	if (!bookLang) {
		return { errorMessage: `Failed to get book contents. Book Slug=${bookUrlSlug}` };
	}

	let userLang = book.user.languages.find((lang) => lang.language_tag === requestLang);
	if (!userLang && book.user.languages.length) {
		userLang = book.user.languages.at(0);
	}
	if (!userLang) {
		return {
			errorMessage: `Failed to get profile contents. User Key-name=${userKeyHandle}`
		};
	}

	return { book, bookRevision, bookLang, userLang, bookNativeLang, isFallbackBookLang };
}
