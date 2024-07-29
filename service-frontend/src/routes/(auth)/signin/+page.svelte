<script lang="ts">
	import { page } from '$app/stores';
	import * as m from '$lib/i18n/paraglide/messages';
	import SignInByOAuth from '$lib/components/service/auth/signin-by-oauth.svelte';
	import NavLinkSmall from '$lib/components/service/navigation/nav-link-small.svelte';

	export let data;

	// After sign-in/sign-up redirect to
	let searchParam = $page.url.search;
</script>

<section class="text-lg">
	<h1 class="mb-2 text-center text-4xl font-semibold">{m.signin_label()}</h1>
	<p class="mb-2">{m.signin_need_agree()}</p>
	<div class="mb-12 flex flex-wrap items-center gap-x-6 gap-y-4">
		<a href="/policies/term" class="underline">{m.footer_about_shortbook_term()}</a>
		<a href="/policies/privacy" class="underline">{m.footer_about_shortbook_privacy()}</a>
	</div>
	<div class="mx-auto mb-12 w-fit">
		<SignInByOAuth callbackUrl={data.callbackUrl} providerName="Google" className="mb-4" />
		<SignInByOAuth callbackUrl={data.callbackUrl} providerName="LinkedIn" className="mb-4" />
		<SignInByOAuth callbackUrl={data.callbackUrl} providerName="GitHub" />
	</div>
	<div class="text-center">
		<p class="mb-2">{m.signin_to_signup()}</p>
		<NavLinkSmall
			name={m.signup_label()}
			href="/signup{searchParam}"
			className="mx-auto w-fit text-2xl"
		/>
	</div>
</section>
