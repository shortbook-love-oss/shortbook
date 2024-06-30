<script lang="ts">
	import { page } from '$app/stores';
	import SignInByOAuth from '$lib/components/service/auth/signin-by-oauth.svelte';
	import NavLinkSmall from '$lib/components/service/navigation/nav-link-small.svelte';

	// After sign-in/sign-up redirect to
	let searchParam = $page.url.search;
</script>

<h1 class="mb-2 text-center text-4xl font-semibold">Sign up</h1>
<p class="mb-12 text-xl">
	By creating an account, you agree to the <a href="/policies/term" class="underline"
		>Terms of use</a
	>
	and
	<a href="/policies/privacy" class="underline">Privacy policy</a>.
</p>
<div class="mx-auto mb-12 w-fit">
	<SignInByOAuth isSignUp providerName="LinkedIn" className="mb-4" />
	<SignInByOAuth isSignUp providerName="GitHub" />
</div>
<div class="text-center text-xl">
	<p class="mb-2">Already have an account?</p>
	<NavLinkSmall
		name="Sign in"
		href="/signin{searchParam}"
		className="mx-auto w-fit text-2xl"
	/>
</div>
