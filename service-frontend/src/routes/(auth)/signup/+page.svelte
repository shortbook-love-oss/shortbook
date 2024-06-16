<script lang="ts">
	import SignInByOAuth from '$lib/components/service/auth/signin-by-oauth.svelte';
</script>

<h1 class="mb-2 text-center text-4xl font-semibold">Sign up</h1>
<p class="mb-12 text-xl">
	By creating an account, you agree to the <a href="/policies/term" class="underline"
		>Terms of use</a
	>
	and
	<a href="/policies/privacy" class="underline">Privacy policy</a>.
</p>
<div class="flex flex-col">
	<div class="mx-auto inline-block">
		<SignInByOAuth isSignUp providerName="LinkedIn" className="mb-4" />
		<SignInByOAuth isSignUp providerName="GitHub" />
	</div>
</div>
