<script lang="ts">
	import { SignIn } from '@auth/sveltekit/components';
	import type { signInProviders } from '$lib/utilities/signin';

	type Props = {
		provider: (typeof signInProviders)[number];
		callbackUrl: string;
		className?: string;
	};
	let { provider, callbackUrl, className = '' }: Props = $props();
</script>

<SignIn
	provider={provider.key}
	signInPage="signin-external"
	options={{ redirectTo: callbackUrl }}
	className="flex rounded-md bg-white text-xl hover:bg-stone-200 focus:bg-stone-200 {className}"
>
	<div slot="submitButton" class="flex items-center justify-center gap-3 p-3">
		<img src="/assets/brands/{provider.key}-logo.png" class="h-8 w-8" alt={provider.label} />
		<p class="text-nowrap text-2xl">{provider.label}</p>
	</div>
</SignIn>
