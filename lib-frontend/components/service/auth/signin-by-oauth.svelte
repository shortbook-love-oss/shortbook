<script lang="ts">
	import SignInByOAuthButton from '$lib/components/service/auth/signin-by-oauth-button.svelte';

	export let isSignUp = false;
	export let providerName: 'Google' | 'LinkedIn' | 'GitHub';
	export let callbackUrl: string;
	export let className = '';
</script>

<SignInByOAuthButton {isSignUp} {providerName} {className} {callbackUrl} />
