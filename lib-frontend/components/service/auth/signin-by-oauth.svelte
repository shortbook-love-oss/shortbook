<script lang="ts">
	import { SignIn } from '@auth/sveltekit/components';

	export let className = '';
	export let providerName: 'LinkedIn' | 'GitHub';
</script>

<SignIn
	provider={providerName.toLowerCase()}
	signInPage="signin"
	className="flex w-full rounded-lg border border-stone-400 bg-white p-4 text-xl hover:bg-stone-200 focus:bg-stone-200 sm:px-6 {className}"
>
	<div slot="submitButton" class="flex items-center gap-3 text-start">
		<img
			src="/assets/brands/{providerName.toLowerCase()}-logo.png"
			class="w-8"
			alt="{providerName} logo"
		/>
		<span>Sign up with {providerName}</span>
	</div>
</SignIn>
