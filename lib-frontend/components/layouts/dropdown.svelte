<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		opener: Snippet;
		children: Snippet;
		name: string; // Need for unique attribute value
		openerColorClass?: string;
		openerClass?: string;
		dropdownClass?: string;
	};
	let {
		opener,
		children,
		name,
		openerColorClass = 'hover:bg-stone-200 focus:bg-stone-200',
		openerClass = '',
		dropdownClass = ''
	}: Props = $props();

	const hideClass = [
		'opacity-0 focus-within:opacity-100 hover:opacity-100 peer-focus/common_dropdown_open:opacity-100',
		'pointer-events-none focus-within:pointer-events-auto hover:pointer-events-auto peer-focus/common_dropdown_open:pointer-events-auto'
	].join(' ');
</script>

<button
	type="button"
	class="peer/common_dropdown_open inline-block {openerColorClass} {openerClass}"
	tabindex="0"
>
	{@render opener()}
</button>

<!-- Dropdown -->
<div
	id="common_dropdown_{name}"
	class="max-w-screen absolute z-40 flex max-h-dvh flex-col rounded-lg border border-stone-400 bg-white {hideClass} {dropdownClass}"
>
	<div class="flex-1 overflow-x-auto p-2">
		{@render children()}
	</div>
</div>
