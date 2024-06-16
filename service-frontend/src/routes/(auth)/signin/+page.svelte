<script lang="ts">
	import { SignIn } from '@auth/sveltekit/components';
</script>

<h1 class="mb-8 text-center text-3xl">Sign in</h1>
<div>
	<SignIn
		provider="linkedin"
		signInPage="signin"
		className="w-full p-4 text-xl mb-2 rounded-lg hover:bg-stone-200 focus:bg-stone-200"
	>
		<div slot="submitButton">Sign in with LinkedIn</div>
	</SignIn>
	<SignIn
		provider="github"
		signInPage="signin"
		className="w-full p-4 text-xl rounded-lg hover:bg-stone-200 focus:bg-stone-200"
	>
		<div slot="submitButton">Sign in with GitHub</div>
	</SignIn>
</div>
