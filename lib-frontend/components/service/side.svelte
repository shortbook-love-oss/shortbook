<script>
	import IconArrowLeft from '~icons/mdi/arrow-left';
	export let isShowBack = false;
</script>

<header>
	<a href="/" class="mb-4 mb-6 block px-4">
		<img
			src="/assets/shortbook-logotype.svg"
			class="m-auto mb-2 aspect-logotype w-full max-w-60"
			alt="Short book logo"
		/>
		{#if isShowBack}
			<div class="flex items-center gap-1">
				<IconArrowLeft width="24" height="24" class="-mx-1" />
				<p class="text-lg">Back to service</p>
			</div>
		{/if}
	</a>
	<nav>
		<slot></slot>
	</nav>
</header>
