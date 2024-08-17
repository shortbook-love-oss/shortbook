<script lang="ts">
	// Need for unique attribute value
	export let name: string;
	export let openerColorClass = 'hover:bg-stone-200 focus:bg-stone-200';
	export let openerClass = '';
	export let dropdownClass = '';
</script>

<div class="peer/common_dropdown_open">
	<button type="button" class="inline-block {openerColorClass} {openerClass}" tabindex="0">
		<slot name="opener" />
	</button>
</div>

<!-- Dropdown -->
<div
	id="common_dropdown_{name}"
	class="max-w-screen absolute z-40 mx-[999rem] flex max-h-dvh flex-col rounded-lg border border-stone-400 bg-white focus-within:mx-0 hover:mx-0 peer-has-[:focus-within]/common_dropdown_open:mx-0 {dropdownClass}"
>
	<div class="flex-1 overflow-x-auto p-2">
		<slot />
	</div>
</div>
