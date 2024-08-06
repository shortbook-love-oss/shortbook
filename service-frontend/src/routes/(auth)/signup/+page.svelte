<script lang="ts">
	import { page } from '$app/stores';
	import * as m from '$lib/i18n/paraglide/messages';
	import { signInProviders } from '$lib/utilities/signin';
	import SigninByEmail from '$lib/components/service/auth/signin-by-email.svelte';
	import SignInByOAuth from '$lib/components/service/auth/signin-by-oauth.svelte';

	export let data;

	// After sign-in/sign-up redirect to
	const searchParam = $page.url.search;
</script>

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
	<div>
		<p class="mb-2 text-center">{m.signup_with_label()}</p>
		<div class="flex flex-wrap items-center justify-center gap-2">
			{#each signInProviders as provider}
				<SignInByOAuth callbackUrl={data.callbackUrl} providerName={provider.label} />
			{/each}
		</div>
	</div>
	<hr class="border-stone-300" />
	<p class="text-center">
		<a href="/signin{searchParam}" class="break-keep underline">{m.signup_to_signin()}</a>
	</p>
</section>
