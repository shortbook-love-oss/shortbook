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
</script>

<div class="peer/common_dropdown_open">
	<button type="button" class="inline-block {openerColorClass} {openerClass}" tabindex="0">
		{@render opener()}
	</button>
</div>

<!-- Dropdown -->
<div
	id="common_dropdown_{name}"
	class="max-w-screen absolute z-40 mx-[999rem] flex max-h-dvh flex-col rounded-lg border border-stone-400 bg-white focus-within:mx-0 hover:mx-0 peer-has-[:focus-within]/common_dropdown_open:mx-0 {dropdownClass}"
>
	<div class="flex-1 overflow-x-auto p-2">
		{@render children()}
	</div>
</div>
