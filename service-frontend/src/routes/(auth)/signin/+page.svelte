<script lang="ts">
	import SignInByOAuth from '$lib/components/service/auth/signin-by-oauth.svelte';
</script>

<h1 class="mb-12 text-center text-4xl font-semibold">Sign in</h1>
<div class="mx-auto inline-block">
	<SignInByOAuth providerName="LinkedIn" className="mb-4" />
	<SignInByOAuth providerName="GitHub" />
</div>
