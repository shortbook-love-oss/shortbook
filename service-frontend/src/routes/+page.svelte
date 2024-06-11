<script>
	import { SignIn, SignOut } from '@auth/sveltekit/components';
</script>

<svelte:head>
	<title>ShortBook</title>
</svelte:head>

<p class="mb-4">Top</p>
<a href="/mypage" class="mb-4">My page</a>
<div>
	<SignIn>
		<span slot="submitButton" class="pa-2 bg-primary-200">Sign in</span>
	</SignIn>
	<SignOut>
		<span slot="submitButton" class="pa-2 bg-primary-200">Signout</span>
	</SignOut>
</div>
