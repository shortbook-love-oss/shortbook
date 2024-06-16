<script lang="ts">
	import { SignIn } from '@auth/sveltekit/components';
</script>

<h1 class="text-xl font-semibold">Sign up</h1>
<p>
	By creating an account, you agree to our <a href="/policies/term">Terms of use</a> and
	<a href="/policies/privacy">Privacy policy</a>.
</p>
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
