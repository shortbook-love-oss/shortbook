<script lang="ts">
	import { page } from '$app/stores';
	import SignInByOAuth from '$lib/components/service/auth/signin-by-oauth.svelte';
	import NavLinkSmall from '$lib/components/service/navigation/nav-link-small.svelte';

	export let data;

	// After sign-in/sign-up redirect to
	const searchParam = $page.url.search;
</script>

<section class="text-lg">
	<h1 class="mb-2 text-center text-4xl font-semibold">Sign up</h1>
	<p class="mb-2">By creating an account, you agree to these policies.</p>
	<div class="mb-12 flex flex-wrap items-center gap-x-8 gap-y-4">
		<a href="/policies/term" class="underline">Terms of use</a>
		<a href="/policies/privacy" class="underline">Privacy policy</a>
	</div>
	<div class="mx-auto mb-12 w-fit">
		<SignInByOAuth isSignUp callbackUrl={data.callbackUrl} providerName="Google" className="mb-4" />
		<SignInByOAuth
			isSignUp
			callbackUrl={data.callbackUrl}
			providerName="LinkedIn"
			className="mb-4"
		/>
		<SignInByOAuth isSignUp callbackUrl={data.callbackUrl} providerName="GitHub" />
	</div>
	<div class="text-center">
		<p class="mb-2">Already have an account?</p>
		<NavLinkSmall name="Sign in" href="/signin{searchParam}" className="mx-auto w-fit text-2xl" />
	</div>
</section>
