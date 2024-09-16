<script lang="ts">
	import IconEmail from '~icons/mdi/email-outline';
	import { page } from '$app/stores';
	import { toLocaleDatetime } from '$lib/utilities/date';
	import { getLanguageTagFromUrl } from '$lib/utilities/url';

	const requestLang = getLanguageTagFromUrl($page.url);

	let { data } = $props();
</script>

<svelte:head>
	<title>Sign in method | ShortBook</title>
</svelte:head>

<h1 class="mb-4 text-2xl font-semibold">Sign in method</h1>
{#if data.isSignedByEmail}
	<div class="mb-8 flex items-center gap-2">
		<IconEmail width="48" height="48" />
		<p class="text-xl">Signed in by email</p>
	</div>
{:else if data.signInProvider}
	<div class="mb-8 flex items-center gap-3">
		<img
			src="/assets/brands/{data.signInProvider.key}-logo.png"
			class="h-12"
			alt="{data.signInProvider.label} logo"
		/>
		<p class="text-xl">Signed in by {data.signInProvider.label}</p>
	</div>
{/if}
<p class="mb-1 font-semibold">Signed up at:</p>
<p class="mb-4">{toLocaleDatetime(data.userCreatedAt, requestLang)}</p>
<p class="mb-1 font-semibold">Last signed in at:</p>
<p>{toLocaleDatetime(data.lastSignedAt, requestLang)}</p>
