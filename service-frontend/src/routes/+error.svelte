<script>
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>{$page.status} {$page.error?.message} | ShortBook</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="flex h-screen flex-col items-center justify-center">
	<div class="max-w-60 mb-8">
		<img src="/assets/shortbook-logotype.svg" class="aspect-logotype w-full" alt="Short book logo" />
	</div>
	<p class="text-2xl">{$page.status}</p>
	<p class="text-lg">{$page.error?.message}</p>
</div>
