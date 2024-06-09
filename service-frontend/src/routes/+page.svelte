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
			<div>
				<form method="POST" action="/signup/credential">
					<div>
						<label for="email">Email</label>
						<input type="email" id="email" name="email" required />
					</div>
					<div>
						<label for="password">Password</label>
						<input type="password" id="password" name="password" required />
					</div>
					<button class="pa-2 bg-primary-200"> Sign In with no script </button>
				</form>
			</div>
		</div>
	</main>
	<Footer />
</div>
