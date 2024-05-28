<script lang="ts">
	import { onMount } from 'svelte';
	import { Textarea } from 'flowbite-svelte';

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

<svelte:head>
	<title>"index.page_title"</title>
</svelte:head>

<div>
	<main>
		<div class="mb-32 bg-stone-50 px-4 py-32">
			<section class="mx-auto flex max-w-4xl flex-col items-center">
				<h1 class="w-full">
					<img
						src="/shortbook-logotype.svg"
						class="mx-auto mb-16 w-3/5 max-w-96"
						alt="common.logo_alt"
					/>
				</h1>
				<p class="mb-4 text-3xl">"index.catch_copy"</p>
				<Textarea
					rows="12"
					class="mb-4 w-full border-primary-700 bg-white text-base"
					bind:value
					on:input={() => saveDraft()}
				>
					<p slot="header">"index.editor_label"</p>
					<div slot="footer">
						{#if showSavedMark}
							<p>"index.saved_status"</p>
						{:else}
							<p>"index.save_info"</p>
						{/if}
					</div>
				</Textarea>
			</section>
		</div>
		<div class="mx-auto mb-32 flex w-4/5 max-w-7xl items-center justify-center gap-16">
			<section>
				<h2 class="mb-8 text-4xl font-normal">"index.about_sb.heading"</h2>
				<p class="mb-8 text-6xl">"index.about_sb.content1"</p>
				<p class="mb-8 text-6xl">"index.about_sb.content2"</p>
			</section>
			<img
				src="/about/books-stand.jpg"
				class="hidden w-1/3 rounded-lg md:block"
				alt="index.about_sb.image_alt"
			/>
		</div>
		<div class="mx-auto mb-32 flex w-4/5 max-w-7xl items-center justify-center gap-16">
			<section>
				<p class="mb-8 text-5xl">"index.join_waitlist.content1"</p>
				<h2 class="mb-12 text-7xl font-normal">"index.join_waitlist.heading"</h2>
				<a
					href="https://shortbook.substack.com/subscribe"
					target="_blank"
					class="rounded-lg bg-gradient-to-b from-yellow-500 to-primary-700 px-8 py-6 text-2xl text-3xl font-bold text-primary-50"
					>"index.join_waitlist.submit"</a
				>
			</section>
			<img
				src="/about/top-screenshot.png"
				class="hidden w-1/2 rounded-lg border-2 border-primary-700 md:block"
				alt="index.join_waitlist.image_alt"
			/>
		</div>
	</main>
	<Footer />
</div>
