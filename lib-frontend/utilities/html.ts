export function escapeHTML(original: string) {
	return original.replace(/&/g, '&amp;')
		.replace(/'/g, '&#x27;')
		.replace(/"/g, '&quot;')
		.replace(/>/g, '&gt;')
		.replace(/</g, '&lt;');
}
