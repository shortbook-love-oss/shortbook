<script lang="ts">
	import SignInByOAuthButton from '$lib/components/service/auth/signin-by-oauth-button.svelte';
	import { onMount } from 'svelte';

	export let isSignUp = false;
	export let providerName: 'Google' | 'LinkedIn' | 'GitHub';
	export let className = '';

	let callbackUrl = '';

	onMount(() => {
		callbackUrl = new URLSearchParams(location.search).get('callbackUrl') ?? '';
	});
</script>

{#if callbackUrl}
	<SignInByOAuthButton {isSignUp} {providerName} {className} {callbackUrl} />
{:else}
	<!-- if disable JS or after failed, set callbackUrl="/" -->
	<SignInByOAuthButton {isSignUp} {providerName} {className} />
{/if}
