<script lang="ts">
	// Need for unique attribute value
	export let name: string;
	export let openerClass = '';
	export let dropdownClass = '';
</script>

<div class="peer/common_dropdown_open">
	<button
		type="button"
		class="inline-block hover:bg-stone-200 focus:bg-stone-200 {openerClass}"
		tabindex="0"
	>
		<slot name="opener" />
	</button>
</div>

<!-- Dropdown -->
<div
	id="common_dropdown_{name}"
	class="max-w-screen fixed z-40 ml-[999rem] flex max-h-dvh flex-col rounded-lg border border-stone-400 bg-white focus-within:ml-0 peer-has-[:focus-within]/common_dropdown_open:ml-0 {dropdownClass}"
>
	<div class="flex-1 overflow-x-auto p-2">
		<slot />
	</div>
</div>
