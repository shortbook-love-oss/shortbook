<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { superForm, filesProxy } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { page } from '$app/stores';
	import Form from '$lib/components/modules/form/form.svelte';
	import { imageMIMEs } from '$lib/utilities/file';
	import { schema } from '$lib/validation/schema/profile-image-update';
	import File from '$lib/components/modules/form/file.svelte';

	// Superforms initialized
	export let formData;
	export let actionUrl: string;
	export let className = '';

	const { form, enhance, validateForm, submitting, message, errors } = superForm(formData, {
		validators: zod(schema)
	});
	const fileProfileImage = filesProxy(form, 'profileImage' as never);

	// Validate and set enable/disable submit button when the input value changes
	let hasVaild = true;
	function validateBackground() {
		validateForm().then((result) => (hasVaild = result.valid));
	}
	const formObserver = form.subscribe(() => validateBackground());
	onMount(() => validateBackground());
	onDestroy(() => formObserver());
</script>

<Form
	method="POST"
	action={actionUrl}
	enctype="multipart/form-data"
	{enhance}
	hasInvalid={!hasVaild}
	isLoading={$submitting}
	submitLabel="Change image"
	successMessage={$page.status === 200 ? $message : ''}
	errorMessage={$page.status === 400 ? $message : ''}
	class={className}
>
	<File
		filesProxy={fileProfileImage}
		name="profileImage"
		required={true}
		acceptTypes={imageMIMEs}
		label="Profile image select"
		buttonSubLabel="Max size 2MB"
		errorMessages={$errors.profileImage}
		className="mb-8 w-full max-w-96"
	/>
</Form>
