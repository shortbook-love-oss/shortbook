<script lang="ts">
	import { page } from '$app/stores';
	import SignInByOAuth from '$lib/components/service/auth/signin-by-oauth.svelte';
	import NavLinkSmall from '$lib/components/service/navigation/nav-link-small.svelte';

	export let data;

	// After sign-in/sign-up redirect to
	let searchParam = $page.url.search;
</script>

<h1 class="mb-4 text-center text-4xl font-semibold">Sign in</h1>
<div class="mx-auto mb-12 w-fit">
	<SignInByOAuth callbackUrl={data.callbackUrl} providerName="Google" className="mb-4" />
	<SignInByOAuth callbackUrl={data.callbackUrl} providerName="LinkedIn" className="mb-4" />
	<SignInByOAuth callbackUrl={data.callbackUrl} providerName="GitHub" />
</div>
<div class="text-center text-xl">
	<p class="mb-2">Don't have an account yet?</p>
	<NavLinkSmall name="Sign up" href="/signup{searchParam}" className="mx-auto w-fit text-2xl" />
</div>
