<script>
	import { SignIn, SignOut } from '@auth/sveltekit/components';
	import Footer from '$lib/components/service/footer.svelte';
</script>

<svelte:head>
	<title>ShortBook</title>
</svelte:head>

<div>
	<main>
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
	</main>
	<Footer />
</div>
