<script lang="ts">
	import { onMount } from 'svelte';
	import { Button, Textarea } from 'flowbite-svelte';
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

<div>
	<main>
		<div class="mb-32 bg-stone-50 px-4 py-32">
			<section class="mx-auto flex max-w-4xl flex-col items-center">
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
			</section>
		</div>
		<div class="mx-auto mb-32 flex w-4/5 max-w-7xl items-center justify-center gap-16">
			<section>
				<h2 class="mb-8 text-4xl font-normal">{$t('index.about_sb.heading')}</h2>
				<p class="mb-8 text-6xl">{$t('index.about_sb.content1')}</p>
				<p class="mb-8 text-6xl">{$t('index.about_sb.content2')}</p>
			</section>
			<img
				src="/about/books-stand.jpg"
				class="hidden w-1/3 rounded-lg md:block"
				alt={$t('index.about_sb.image_alt')}
			/>
		</div>
		<div class="mx-auto mb-32 flex w-4/5 max-w-7xl items-center justify-center gap-16">
			<section>
				<p class="mb-8 text-5xl">{$t('index.join_waitlist.content1')}</p>
				<h2 class="mb-12 text-7xl font-normal">{$t('index.join_waitlist.heading')}</h2>
				<a
					href="https://shortbook.substack.com/subscribe"
					target="_blank"
					class="to-primary-700 text-primary-50 rounded-lg bg-gradient-to-b from-yellow-500 px-8 py-6 text-2xl text-3xl font-bold"
					>{$t('index.join_waitlist.submit')}</a
				>
			</section>
			<img
				src="/about/top-screenshot.png"
				class="border-primary-700 hidden w-1/2 rounded-lg border-2 md:block"
				alt={$t('index.join_waitlist.image_alt')}
			/>
		</div>
	</main>
	<Footer />
</div>
