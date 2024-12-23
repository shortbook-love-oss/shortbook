<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { filesProxy, superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { page } from '$app/stores';
	import { imageMIMEextension } from '$lib/utilities/file';
	import { schema } from '$lib/validation/schema/user/profile/image-update';
	import Form from '$lib/components/modules/form/form.svelte';
	import File from '$lib/components/modules/form/file.svelte';

	type Props = {
		formData: SuperValidated<Record<string, unknown>>;
		actionUrl: string;
		className?: string;
	};
	let { formData, actionUrl, className = '' }: Props = $props();

	const { form, enhance, validateForm, submitting, message, errors } = superForm(formData, {
		validators: zod(schema)
	});
	const fileProfileImage = filesProxy(form, 'profileImage' as never);

	// Validate and set enable/disable submit button when the input value changes
	let hasVaild = $state(true);
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
	errorMessage={400 <= $page.status && $page.status <= 599 ? $message : ''}
	class={className}
>
	<File
		filesProxy={fileProfileImage}
		name="profileImage"
		label="Profile image select"
		required={true}
		maxSize={2}
		acceptTypes={Object.keys(imageMIMEextension)}
		errorMessages={$errors.profileImage}
		className="mb-8 w-full max-w-96"
	/>
</Form>
