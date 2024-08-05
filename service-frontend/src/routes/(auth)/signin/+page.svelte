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
	<h1 class="text-center text-4xl font-semibold">{m.signin_label()}</h1>
	<SigninByEmail formData={data.form} submitLabel={m.signin_label()} />
	<div>
		<p class="mb-2 text-center">{m.signin_with_label()}</p>
		<div class="flex flex-wrap items-center justify-center gap-2">
			{#each signInProviders as provider}
				<SignInByOAuth callbackUrl={data.callbackUrl} providerName={provider.label} />
			{/each}
		</div>
	</div>
	<hr class="border-stone-300" />
	<p class="text-center">
		<a href="/signup{searchParam}" class="break-keep underline">{m.signin_to_signup()}</a>
	</p>
</section>
