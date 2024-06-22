<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { page } from '$app/stores';
	import Form from '$lib/components/modules/form/form.svelte';
	import TextField from '$lib/components/modules/form/text-field.svelte';
	import ProfileCard from '$lib/components/service/mypage/profile-card.svelte';
	import { removeLangTag } from '$lib/utilities/url';
	import { schema } from '$lib/validation/schema/user-delete';

	export let data;

	const { form, enhance, validateForm, submitting, errors } = superForm(data.form, {
		resetForm: false, // Prevents reverting to initial value after submission
		validators: zod(schema)
	});

	// Validate and set enable/disable submit button when the input value changes
	let hasVaild = true;
	function validateBackground() {
		validateForm().then((result) => (hasVaild = result.valid));
	}
	const formObserver = form.subscribe(() => validateBackground());
	onMount(() => validateBackground());
	onDestroy(() => formObserver());

	const user = $page.data.session?.user;
	const actionUrl = removeLangTag($page.url.pathname);
	const warnMessage =
		'If you delete a user, you can restore them for 30 days by simply signing in. However, after 30 days, user data will be permanently deleted.';
	const errorMessage = 'There was an error, please check your input and resubmit.';
</script>

<svelte:head>
	<title>Danger action | ShortBook</title>
</svelte:head>

<h1 class="mb-4 text-2xl font-semibold">Danger action — Delete user</h1>
<ProfileCard name={data.penName} imageSrc={user?.image ?? ''} className="mb-8" />
<Form
	method="POST"
	action={actionUrl}
	{enhance}
	hasInvalid={!hasVaild}
	isLoading={$submitting}
	submitLabel="Delete user"
	{warnMessage}
	errorMessage={$page.status === 400 ? errorMessage : ''}
>
	<input type="hidden" name="slug" value={$form.slug} />
	<TextField
		bind:value={$form.deleteKey}
		name="deleteKey"
		label="Type &quot;{$form.slug}&quot; to delete user data."
		errorMessages={$errors.deleteKey}
		className="mb-8"
	/>
</Form>
