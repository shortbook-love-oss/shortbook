<script lang="ts">
	import { SignIn } from '@auth/sveltekit/components';

	export let isSignUp = false;
	export let providerName: 'LinkedIn' | 'GitHub';
	export let callbackUrl = '/';
	export let className = '';
</script>

<SignIn
	provider={providerName.toLowerCase()}
	signInPage="signin"
	options={{ redirectTo: callbackUrl }}
	className="flex w-full rounded-lg border border-stone-400 bg-white text-xl hover:bg-stone-200 focus:bg-stone-200 {className}"
>
	<div slot="submitButton" class="flex items-center gap-3 p-4 text-start sm:px-6">
		<img
			src="/assets/brands/{providerName.toLowerCase()}-logo.png"
			class="w-8"
			alt="{providerName} logo"
		/>
		<span>Sign {isSignUp ? 'up' : 'in'} with {providerName}</span>
	</div>
</SignIn>
