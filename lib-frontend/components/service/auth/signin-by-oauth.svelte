<script lang="ts">
	import { onMount } from 'svelte';
	import SignInByOAuthButton from '$lib/components/service/auth/signin-by-oauth-button.svelte';
	import { callbackParam } from '$lib/utilities/url';

	export let isSignUp = false;
	export let providerName: 'Google' | 'LinkedIn' | 'GitHub';
	export let className = '';

	let callbackUrl = '';

	onMount(() => {
		callbackUrl = new URLSearchParams(location.search).get(callbackParam) ?? '';
	});
</script>

{#if callbackUrl}
	<SignInByOAuthButton {isSignUp} {providerName} {className} {callbackUrl} />
{:else}
	<!-- if disable JS or after failed, set callbackUrl="/" -->
	<SignInByOAuthButton {isSignUp} {providerName} {className} />
{/if}
