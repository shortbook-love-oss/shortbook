<script lang="ts">
	import Meta from '$lib/components/service/meta.svelte';
	import LayoutRule from '../_layout-rule.svelte';
</script>

<svelte:head>
	<Meta />
</svelte:head>

<LayoutRule>
	<div slot="header" class="flex justify-center border-b border-stone-300 px-8 py-1">
		<a href="/" class="rounded-md px-3 py-2 hover:bg-stone-200 focus:bg-stone-200">
			<img
				src="/assets/shortbook-logotype.svg"
				class="aspect-logotype w-48"
				alt="Short book logo"
			/>
		</a>
	</div>
	<slot />
</LayoutRule>
