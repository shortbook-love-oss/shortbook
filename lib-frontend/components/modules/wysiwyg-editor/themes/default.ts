import type { EditorThemeClasses } from 'lexical';

export const theme: EditorThemeClasses = {
	root: 'h-full font-sans text-[1.375rem] leading-[1.625] tracking-wider text-stone-950 underline-offset-[0.15em] outline-none',
	code: 'my-4 block bg-slate-100 ps-14 pe-3 py-2 text-stone-500 text-[0.75em] [counter-reset:code-row] [counter-increment:code-row] [&>br]:[counter-increment:code-row] [&>span:first-child]:before:[content:counter(code-row)] [&>span:first-child]:before:-ms-11 [&>span:first-child]:before:w-11 [&>span:first-child]:before:inline-block [&>br+span]:before:[content:counter(code-row)] [&>br+span]:before:-ms-11 [&>br+span]:before:w-11 [&>br+span]:before:inline-block',
	heading: {
		h1: '[&:not(:first-child)]:mt-8 mb-4 text-[3.25em] font-semibold leading-[1.25]',
		h2: '[&:not(:first-child)]:mt-8 mb-4 text-[2em] font-semibold leading-[1.25]',
		h3: '[&:not(:first-child)]:mt-8 mb-4 text-[1.5em] font-semibold leading-[1.3125]',
		h4: 'my-4 text-[1.25em] font-semibold leading-[1.3125]',
		h5: 'my-4 text-[1.1em] font-semibold leading-[1.375]',
		h6: 'my-4 font-semibold leading-[1.375]'
	},
	link: 'cursor-pointer text-primary-700 underline',
	list: {
		ol: 'my-4 list-decimal ps-8',
		ul: 'my-4 list-disc ps-6'
	},
	quote: 'my-4 rounded-2xl bg-stone-200/80 p-6 text-[1.25em]',
	text: {
		code: 'bg-slate-100 p-1 text-[0.875em]',
		strikethrough: 'line-through'
	}
};
