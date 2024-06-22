<script lang="ts">
	export let className = '';
	export let hasInvalid = false;
	export let isLoading = false;
</script>

<button
	class="rounded-lg border-2 border-primary-700 bg-primary-100 px-4 py-3 text-xl text-primary-950 {hasInvalid ||
	isLoading
		? 'border-stone-400 bg-stone-100 text-stone-500'
		: ''} {hasInvalid ? 'cursor-not-allowed' : ''} {isLoading ? 'cursor-wait' : ''} {className}"
	type={hasInvalid || isLoading ? 'button' : 'submit'}
	aria-disabled={hasInvalid || isLoading ? true : undefined}
>
	<slot />
</button>
