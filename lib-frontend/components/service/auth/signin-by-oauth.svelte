<script lang="ts">
	import { SignIn } from '@auth/sveltekit/components';

	export let providerName: string;
	export let callbackUrl: string;
	export let className = '';
</script>

<SignIn
	provider={providerName.toLowerCase()}
	signInPage="signin-external"
	options={{ redirectTo: callbackUrl }}
	className="flex w-fit rounded-md bg-white text-xl hover:bg-stone-200 focus:bg-stone-200 {className}"
>
	<div slot="submitButton" class="flex h-16 w-16 items-center justify-center p-3">
		<img
			src="/assets/brands/{providerName.toLowerCase()}-logo.png"
			class="max-h-full max-w-full"
			alt={providerName}
		/>
	</div>
</SignIn>
