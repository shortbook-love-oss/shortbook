<script lang="ts">
	export let heading = '';
	export let content = '';
	export let description = '';
</script>

<section class="mx-auto mb-16 max-w-2xl px-4 sm:px-8">
	<h2 class="border-primary-700 mb-4 border-l-8 pl-4 text-4xl font-bold">{heading}</h2>
	<p class="mb-4 pl-6 text-2xl">{content}</p>
	{#if description}
		<p class="mb-4 pl-6">{description}</p>
	{/if}
</section>
