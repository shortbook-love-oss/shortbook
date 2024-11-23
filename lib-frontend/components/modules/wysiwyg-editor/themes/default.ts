import type { EditorThemeClasses } from 'lexical';

export const theme: EditorThemeClasses = {
	code: 'sb_bc__code',
	codeHighlight: {
		atrule: 'text-[#07a]',
		attr: 'text-[#07a]',
		boolean: 'text-[#905]',
		builtin: 'text-[#690]',
		cdata: 'text-[slategray]',
		char: 'text-[#690]',
		class: 'text-[#dd4a68]',
		'class-name': 'text-[#dd4a68]',
		comment: 'text-[slategray]',
		constant: 'text-[#905]',
		deleted: 'text-[#905]',
		doctype: 'text-[slategray]',
		entity: 'text-[#9a6e3a]',
		function: 'text-[#dd4a68]',
		important: 'text-[#e90]',
		inserted: 'text-[#690]',
		keyword: 'text-[#07a]',
		namespace: 'text-[#e90]',
		number: 'text-[#905]',
		operator: 'text-[#9a6e3a]',
		prolog: 'text-[slategray]',
		property: 'text-[#905]',
		punctuation: 'text-[#999]',
		regex: 'text-[#e90]',
		selector: 'text-[#690]',
		string: 'text-[#690]',
		symbol: 'text-[#905]',
		tag: 'text-[#905]',
		url: 'text-[#9a6e3a]',
		variable: 'text-[#e90]'
	},
	heading: {
		h1: '[&:not(:first-child)]:mt-8 mb-4 text-[3.25em] font-semibold leading-[1.25]',
		h2: '[&:not(:first-child)]:mt-8 mb-4 text-[2em] font-semibold leading-[1.25]',
		h3: '[&:not(:first-child)]:mt-8 mb-4 text-[1.5em] font-semibold leading-[1.3125]',
		h4: 'my-4 text-[1.25em] font-semibold leading-[1.3125]',
		h5: 'my-4 text-[1.1em] font-semibold leading-[1.375]',
		h6: 'my-4 font-semibold leading-[1.375]'
	},
	link: 'cursor-pointer break-words text-primary-700 underline [word-break:break-word]',
	list: {
		ol: 'my-4 list-decimal ps-8',
		ul: 'my-4 list-disc ps-6'
	},
	quote: 'sb_bc__quote',
	text: {
		bold: 'font-bold',
		code: 'bg-slate-100 p-1 text-[0.875em] tracking-wide',
		italic: 'italic',
		strikethrough: 'line-through'
	}
};
