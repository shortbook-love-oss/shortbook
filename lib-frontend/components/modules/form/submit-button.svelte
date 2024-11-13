<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		hasInvalid?: boolean;
		isLoading?: boolean;
		className?: string;
		[key: string]: unknown;
	};
	let {
		children,
		hasInvalid = false,
		isLoading = false,
		className = '',
		...restProps
	}: Props = $props();

	const cursorClass = $state(
		(() => {
			if (hasInvalid) {
				return 'cursor-no-drop';
			} else if (isLoading) {
				return 'cursor-wait';
			}
			return '';
		})()
	);
</script>

<button
	class="flex items-center justify-center gap-2 rounded-lg border-2 border-primary-700 bg-primary-100 px-4 py-3 text-xl {hasInvalid ||
	isLoading
		? 'border-stone-400 bg-stone-100 text-stone-700'
		: 'text-stone-950 hover:bg-primary-200'} {cursorClass} {className}"
	type={hasInvalid || isLoading ? 'button' : 'submit'}
	aria-disabled={hasInvalid || isLoading ? true : undefined}
	{...restProps}
>
	{@render children()}
</button>
