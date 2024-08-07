<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import IconCheck from '~icons/mdi/check';
	import { page } from '$app/stores';
	import * as m from '$lib/i18n/paraglide/messages';
	import { schema } from '$lib/validation/schema/signin-by-email';
	import Form from '$lib/components/modules/form/form.svelte';
	import TextField from '$lib/components/modules/form/text-field.svelte';
	import SubmitButton from '$lib/components/modules/form/submit-button.svelte';

	export let formData;
	export let submitLabel = 'Sign in';

	const { form, enhance, validateForm, submitting, message, errors } = superForm(formData, {
		resetForm: false,
		validators: zod(schema)
	});

	$: successMessage = $page.status === 200 ? $message : '';

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
	action={$page.url.pathname + $page.url.search}
	{enhance}
	hasInvalid={!hasVaild}
	isLoading={$submitting}
	{submitLabel}
	submitClass="w-full"
	errorMessage={$page.status === 400 ? $message : ''}
>
	<TextField
		bind:value={$form.email}
		name="email"
		label={m.sign_form_email_label()}
		required={true}
		placeholder="your-address@email.example"
		errorMessages={$errors.email}
		className="mb-4"
	/>
	<svelte:fragment slot="submit">
		<SubmitButton isLoading={$submitting} className="mb-2 w-full">
			{submitLabel}
		</SubmitButton>
		{#if successMessage}
			<div class="flex animate-hide-delay items-center gap-1 text-emerald-900">
				<IconCheck width="28" height="28" class="shrink-0" />
				<p class="text-lg leading-snug">{successMessage}</p>
			</div>
		{/if}
	</svelte:fragment>
</Form>
