<script lang="ts">
	import { page } from '$app/stores';
	import * as m from '$i18n/output/messages';
	import SigninByEmail from '$lib/components/service/auth/signin-by-email.svelte';
	import Ogp from '$lib/components/service/ogp.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{m.signup_label()} | ShortBook</title>
	<Ogp pageType="website" title="ShortBook — {m.signup_label()}" />
</svelte:head>

<section class="flex flex-col gap-8 text-lg">
	<div>
		<h1 class="mb-2 text-center text-4xl font-semibold">{m.signup_label()}</h1>
		<p class="mb-1">{m.signup_need_agree()}</p>
		<div class="flex flex-wrap items-center gap-x-6 gap-y-4">
			<a href="/policies/term" target="_blank" class="underline"
				>{m.footer_about_shortbook_term()}</a
			>
			<a href="/policies/privacy" target="_blank" class="underline"
				>{m.footer_about_shortbook_privacy()}</a
			>
		</div>
	</div>
	<SigninByEmail formData={data.form} submitLabel={m.signup_label()} />
	<hr class="border-stone-300" />
	<p class="text-center">
		<a href="/signin{$page.url.search}" class="break-keep underline">{m.signup_to_signin()}</a>
	</p>
</section>
