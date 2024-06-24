<script lang="ts">
	// Need for unique attribute value
	export let name: string;
	export let dropdownClass = '';
</script>

<div class="peer/common_dropdown_open">
	<button type="button" class="inline-block hover:bg-stone-200 focus:bg-stone-200">
		<slot name="opener" />
	</button>
</div>

<!-- Dropdown -->
<div
	id="common_dropdown_{name}"
	class="max-w-screen fixed top-[999%] z-40 flex max-h-dvh max-h-screen flex-col rounded-lg border-2 border-stone-400 bg-white focus-within:top-auto peer-has-[:focus-within]/common_dropdown_open:top-auto {dropdownClass}"
>
	<div class="flex-1 overflow-x-auto p-2">
		<slot />
	</div>
</div>
