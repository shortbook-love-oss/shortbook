<script lang="ts">
	import { SignIn } from '@auth/sveltekit/components';
	import type { signInProviders } from '$lib/utilities/signin';

	export let provider: (typeof signInProviders)[number];
	export let callbackUrl: string;
	export let className = '';
</script>

<SignIn
	provider={provider.key}
	signInPage="signin-external"
	options={{ redirectTo: callbackUrl }}
	className="flex w-fit rounded-md bg-white text-xl hover:bg-stone-200 focus:bg-stone-200 {className}"
>
	<div slot="submitButton" class="flex h-16 w-16 items-center justify-center p-3">
		<img
			src="/assets/brands/{provider.key}-logo.png"
			class="max-h-full max-w-full"
			alt={provider.label}
		/>
	</div>
</SignIn>
