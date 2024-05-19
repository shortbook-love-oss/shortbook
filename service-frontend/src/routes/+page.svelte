<script lang="ts">
	import { onMount } from 'svelte';
	import { Textarea } from 'flowbite-svelte';
	import { t } from '$lib/translations/translations';

	import Footer from '$lib/components/service/footer.svelte';

	let value = '';
	let showSavedMark = false;

	onMount(() => {
		value = localStorage.getItem('article') ?? '';
	});

	function saveDraft() {
		window.localStorage.setItem('article', value);
		showSavedMark = true;
		setTimeout(() => {
			showSavedMark = false;
		}, 2000);
	}
</script>

<div class="h-screen bg-stone-50 px-4 py-8">
	<main class="mx-auto mb-8 flex max-w-4xl flex-col items-center">
		<h1 class="w-full">
			<img
				src="/shortbook-logotype.svg"
				class="mx-auto mb-16 w-3/5 max-w-96"
				alt={$t('common.logo_alt')}
			/>
		</h1>
		<p class="mb-4 text-3xl">{$t('index.catch_copy')}</p>
		<Textarea
			rows="12"
			class="border-primary-700 mb-4 w-full bg-white text-base"
			bind:value
			on:input={() => saveDraft()}
		>
			<p slot="header">{$t('index.editor_label')}</p>
			<div slot="footer">
				{#if showSavedMark}
					<p>{$t('index.saved_status')}</p>
				{:else}
					<p>{$t('index.save_info')}</p>
				{/if}
			</div>
		</Textarea>
	</main>
	<Footer />
</div>
