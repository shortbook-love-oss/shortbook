<script lang="ts">
	export let className = '';
	export let isLoading = false;
</script>

<button
	class="rounded-lg border-2 border-primary-700 bg-primary-100 px-4 py-3 text-xl text-primary-950 {isLoading
		? 'cursor-wait border-stone-400 bg-stone-100 text-stone-500'
		: ''} {className}"
	type={isLoading ? 'button' : 'submit'}
	aria-disabled={isLoading}
>
	<slot />
</button>
