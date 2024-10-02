<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		formaction?: string;
		hasInvalid?: boolean;
		isLoading?: boolean;
		className?: string;
	};
	let {
		children,
		formaction = '',
		hasInvalid = false,
		isLoading = false,
		className = ''
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
	class="flex items-center justify-center gap-2 rounded-lg px-4 py-[0.875rem] text-xl {hasInvalid ||
	isLoading
		? 'border-stone-400 bg-stone-200 text-stone-700'
		: 'text-stone-950 hover:bg-stone-500/30'} {cursorClass} {className}"
	type={hasInvalid || isLoading ? 'button' : 'submit'}
	{formaction}
	aria-disabled={hasInvalid || isLoading ? true : undefined}
>
	{@render children()}
</button>
