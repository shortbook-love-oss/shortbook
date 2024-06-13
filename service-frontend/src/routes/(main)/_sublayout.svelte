<script>
	import IconArrowLeft from '~icons/mdi/arrow-left';
	import NavSp from '$lib/components/service/navigation/nav-sp.svelte';

	export let isShowBack = false;
</script>

<div class="hidden w-48 sm:block">
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
			<slot name="nav"></slot>
		</nav>
	</header>
</div>
<div class="fixed bottom-0 left-0 w-full sm:hidden">
	<NavSp />
</div>
<main class="flex-1">
	<slot></slot>
</main>
