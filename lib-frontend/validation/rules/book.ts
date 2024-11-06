import { bookTextAlignSelect } from '$lib/utilities/book';

export function validateBookTextAlign(value: string) {
	return bookTextAlignSelect.some((c) => c.value === value);
}

// Validate if input conforms to Lexical editor-state
export function validateEditorContent(value: Record<string, Record<string, unknown>>) {
	try {
		const blockNodes = value.root.children;
		return Array.isArray(blockNodes);
	} catch {
		return false;
	}
}
