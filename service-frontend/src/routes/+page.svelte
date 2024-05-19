<script lang="ts">
	import { Button, Textarea } from 'flowbite-svelte';
	import { t } from '$lib/translations/translations';

	let value = '';

	function saveDraft() {
		console.log(value);
	}
</script>

<div class="h-screen bg-stone-50 px-4 py-8">
	<div class="mx-auto flex max-w-4xl flex-col items-center">
		<img src="/shortbook-logotype.svg" class="mb-16 w-3/5 max-w-96" alt={$t('common.logo_alt')} />
		<p class="mb-4 text-3xl">{$t('index.catch_copy')}</p>
		<Textarea
			placeholder={$t('index.draft_placeholder')}
			rows="12"
			class="border-primary-700 mb-4 w-full"
			bind:value
		/>
		<Button
			class="to-primary-700 bg-gradient-to-b from-yellow-500 text-2xl"
			on:click={() => saveDraft()}>{$t('index.save_label')}</Button
		>
	</div>
</div>
