<script lang="ts">
	import IconEmail from '~icons/mdi/email-outline';

	export let data;
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
{:else}
	<div class="mb-8 flex items-center gap-3">
		<img
			src="/assets/brands/{data.providerName.toLowerCase()}-logo.png"
			class="w-12"
			alt="{data.providerName} logo"
		/>
		<p class="text-xl">Signed in by {data.providerName}</p>
	</div>
{/if}
<p class="mb-1 font-semibold">Signed up at:</p>
<p class="mb-4">{data.userCreatedAt}</p>
<p class="mb-1 font-semibold">Last signed in at:</p>
<p>{data.lastSignedAt}</p>
