import { bookTextAlignSelect } from '$lib/utilities/book';

export function validateBookTextAlign(value: string) {
	return bookTextAlignSelect.some((c) => c.value === value);
}
