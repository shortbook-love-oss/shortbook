<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { page } from '$app/stores';
	import { schema } from '$lib/validation/schema/user-delete';
	import Form from '$lib/components/modules/form/form.svelte';
	import TextField from '$lib/components/modules/form/text-field.svelte';
	import ProfileCard from '$lib/components/service/mypage/profile-card.svelte';

	let { data } = $props();

	const { form, enhance, validateForm, submitting, message, errors } = superForm(data.form, {
		resetForm: false, // Prevents reverting to initial value after submission
		validators: zod(schema)
	});

	// Validate and set enable/disable submit button when the input value changes
	let hasVaild = $state(true);
	function validateBackground() {
		validateForm().then((result) => (hasVaild = result.valid));
	}
	const formObserver = form.subscribe(() => validateBackground());
	onMount(() => validateBackground());
	onDestroy(() => formObserver());

	const user = $page.data.session?.user;
	const warnMessage =
		'If you delete a user, you can restore them for 30 days by simply signing in. However, after 30 days, user data will be permanently deleted.';
</script>

<svelte:head>
	<title>Danger action | ShortBook</title>
</svelte:head>

<h1 class="mb-4 text-2xl font-semibold">Danger action — Delete user</h1>
<ProfileCard name={data.penName} imageSrc={user?.image ?? ''} className="mb-8" />
<Form
	method="POST"
	action={$page.url.pathname}
	{enhance}
	hasInvalid={!hasVaild}
	isLoading={$submitting}
	submitLabel="Delete user"
	{warnMessage}
	errorMessage={$page.status === 400 ? $message : ''}
>
	<input type="hidden" name="keyName" value={$form.keyName} />
	<TextField
		bind:value={$form.deleteKey}
		name="deleteKey"
		label="Type &quot;{$form.keyName}&quot; to delete user data."
		errorMessages={$errors.deleteKey}
		className="mb-8"
	/>
</Form>
