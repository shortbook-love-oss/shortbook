<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { page } from '$app/stores';
	import Form from '$lib/components/modules/form/form.svelte';
	import TextField from '$lib/components/modules/form/text-field.svelte';
	import ProfileCard from '$lib/components/service/mypage/profile-card.svelte';
	import { getLangTag, removeLangTag } from '$lib/utilities/url';
	import { schema } from '$lib/validation/schema/user-delete';

	export let data;

	const { form, enhance, submitting, message, errors, allErrors } = superForm(data.form, {
		resetForm: false, // Prevents reverting to initial value after submission
		validators: zod(schema),
		onUpdated: ({ form }) => {
			if (form.valid) {
				setTimeout(() => {
					location.href = '/' + getLangTag(location.pathname);
				}, 2000);
			}
		}
	});
	const user = $page.data.session?.user;
	const actionUrl = removeLangTag($page.url.pathname);
</script>

<svelte:head>
	<title>Delete user | ShortBook</title>
</svelte:head>

<h1 class="mb-4 text-2xl font-semibold">Delete user</h1>
<ProfileCard name={data.penName} imageSrc={user?.image ?? ''} className="mb-8" />
<Form
	method="POST"
	action={actionUrl}
	{enhance}
	hasInvalid={$allErrors.length > 0}
	isLoading={$submitting}
	submitLabel="Delete user"
	successMessage={$page.status === 200 ? $message : ''}
	errorMessage={$page.status === 400
		? 'There was an error, please check your input and resubmit.'
		: ''}
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
