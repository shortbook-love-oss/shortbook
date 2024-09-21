<script lang="ts">
	import { page } from '$app/stores';
	import * as m from '$i18n/output/messages';
	import SigninByEmail from '$lib/components/service/auth/signin-by-email.svelte';

	let { data } = $props();
</script>

<section class="flex flex-col gap-8 text-lg">
	<h1 class="text-center text-4xl font-semibold">{m.signin_label()}</h1>
	<SigninByEmail formData={data.form} submitLabel={m.signin_label()} />
	<hr class="border-stone-300" />
	<p class="text-center">
		<a href="/signup{$page.url.search}" class="break-keep underline">{m.signin_to_signup()}</a>
	</p>
</section>
